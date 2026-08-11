import axios from "axios";
import * as cheerio from "cheerio";
import { chromium } from "playwright";
import { Scraper } from "../../core/scraper.interface.js";
import { NormalizedHackathon } from "../../core/schema.js";
import { logger } from "../../core/logger.js";
import {
  determineLocationType,
  detectTracks,
  extractPrizePool,
  formatDescription,
} from "../../core/enrichment.js";
import { mapWithConcurrency } from "../../core/detail-enrichment.js";

export class DoraHacksScraper implements Scraper {
  private readonly baseUrl = "https://dorahacks.io/hackathon";
  private readonly userAgent =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
  private readonly detailConcurrency = 1;

  private async fetchSlugsWithPlaywright(): Promise<string[]> {
    const slugSet = new Set<string>();
    try {
      logger.info({ url: this.baseUrl }, "Launching Playwright Chromium browser for DoraHacks...");
      const browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({ userAgent: this.userAgent });
      const page = await context.newPage();

      await page.goto(this.baseUrl, { waitUntil: "domcontentloaded", timeout: 20000 });

      // Incremental scroll up to 15 times to trigger lazy-loaded cards
      for (let scroll = 0; scroll < 15; scroll++) {
        await page.evaluate(() => window.scrollBy(0, 1000));
        await page.waitForTimeout(400);
      }

      const content = await page.content();
      const matches = content.match(/\/hackathon\/([a-z0-9-]+)\/?/gi) || [];
      for (const match of matches) {
        const slug = match.replace(/\/hackathon\//, "").replace(/\//g, "").trim();
        if (slug && slug !== "hackathon" && !slug.startsWith("create")) {
          slugSet.add(slug);
        }
      }

      await browser.close();
    } catch (err) {
      logger.warn({ error: String(err) }, "Playwright browser fetch failed — falling back to HTTP fetch");
    }
    return Array.from(slugSet);
  }

  async scrape(): Promise<NormalizedHackathon[]> {
    logger.info({ baseUrl: this.baseUrl }, "Starting DoraHacks scrape");

    const slugSet = new Set<string>();

    // 1. Primary: Try dynamic browser rendering via Playwright
    const playwrightSlugs = await this.fetchSlugsWithPlaywright();
    playwrightSlugs.forEach((s) => slugSet.add(s));

    // 2. Secondary: HTTP category page search if Playwright returns 0 slugs
    if (slugSet.size === 0) {
      const categoryUrls = [
        "https://dorahacks.io/hackathon",
        "https://dorahacks.io/hackathon?status=open",
        "https://dorahacks.io/hackathon?status=upcoming",
      ];

      for (const url of categoryUrls) {
        let attempts = 0;
        let success = false;
        while (attempts < 2 && !success) {
          attempts++;
          try {
            const res = await axios.get(url, {
              headers: {
                "User-Agent": this.userAgent,
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              },
              timeout: 15000,
            });

            const html = res.data || "";
            const matches = html.match(/\/hackathon\/([a-z0-9-]+)\/?/gi) || [];
            for (const match of matches) {
              const slug = match
                .replace(/\/hackathon\//, "")
                .replace(/\//g, "")
                .trim();
              if (slug && slug !== "hackathon" && !slug.startsWith("create")) {
                slugSet.add(slug);
              }
            }
            success = true;
          } catch (error) {
            if (attempts >= 2) {
              logger.warn({ url, error: String(error) }, "Error fetching DoraHacks category page");
            }
          }
        }
      }
    }

    const fallbackSlugs = [
      "weex-ai-wars2",
      "buidl-ctc-2026-fall",
      "flaresummersignal",
      "delphi-agent-competition",
      "creativeminds",
    ];

    if (slugSet.size === 0) {
      logger.info({ fallbackCount: fallbackSlugs.length }, "Using fallback DoraHacks hackathon slugs");
      fallbackSlugs.forEach((s) => slugSet.add(s));
    }

    const slugs = Array.from(slugSet);
    logger.info({ foundSlugs: slugs.length }, "Discovered DoraHacks hackathon slugs");

    const detailResults = await mapWithConcurrency(slugs, this.detailConcurrency, async (slug) => {
      let attempts = 0;
      let rawData: any = null;

      while (attempts < 3 && !rawData) {
        attempts++;
        try {
          // Polite delay between requests to respect rate limits
          await new Promise((r) => setTimeout(r, 400));

          const detailUrl = `https://dorahacks.io/hackathon/${slug}/`;
          const res = await axios.get(detailUrl, {
            headers: {
              "User-Agent": this.userAgent,
              Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
            timeout: 15000,
          });

          const $ = cheerio.load(res.data);
          $("script").each((_i, el) => {
            const scriptText = $(el).html() || "";
            const matchEscaped = scriptText.match(/"(\{\\"schema\\":\\"HACKATHON\\",[\s\S]*?\})"/);
            const matchUnescaped = scriptText.match(/(\{"schema":"HACKATHON",[\s\S]*?\})/);

            if (matchEscaped?.[1]) {
              try {
                const jsonStr = JSON.parse(`"${matchEscaped[1]}"`);
                const parsed = JSON.parse(jsonStr);
                if (parsed?.d) rawData = parsed.d;
              } catch (_) {}
            } else if (matchUnescaped?.[1]) {
              try {
                const parsed = JSON.parse(matchUnescaped[1]);
                if (parsed?.d) rawData = parsed.d;
              } catch (_) {}
            }
          });

          break;
        } catch (error: any) {
          const status = error?.response?.status;
          if (status === 429 && attempts < 3) {
            logger.warn({ slug, attempt: attempts }, "DoraHacks 429 rate limited — waiting 2s before retry...");
            await new Promise((r) => setTimeout(r, 2000));
          } else if (attempts >= 3) {
            logger.warn({ slug, error: String(error) }, "Failed fetching DoraHacks detail page");
          }
        }
      }

      return rawData;
    });

    const hackathons: NormalizedHackathon[] = [];

    for (const raw of detailResults) {
      if (!raw) continue;
      try {
        const normalized = this.normalize(raw);
        if (normalized) {
          hackathons.push(normalized);
        }
      } catch (err) {
        logger.warn({ error: String(err), title: raw?.title }, "Failed soft normalization of DoraHacks record");
      }
    }

    logger.info({ normalizedCount: hackathons.length }, "Completed DoraHacks scrape");
    return hackathons;
  }

  public normalize(raw: any): NormalizedHackathon | null {
    if (!raw.title || !raw.id || !raw.timelineStart) {
      return null;
    }

    const startsAtDate = new Date(raw.timelineStart * 1000);
    if (isNaN(startsAtDate.getTime())) {
      return null;
    }

    const endsAtDate = raw.timelineEnd ? new Date(raw.timelineEnd * 1000) : undefined;

    const rawLocationName = raw.venueName || (raw.venueForm === "Virtual" ? "Online" : raw.venueForm || "Online");
    const locationType = determineLocationType({
      formatType: raw.venueForm || "Virtual",
      locationName: rawLocationName,
    });

    let prizePool: string = "Prizes Available";
    if (typeof raw.bonusPrice === "number" && raw.bonusPrice > 0) {
      const formattedNum = raw.bonusPrice.toLocaleString("en-US");
      const token = String(raw.bonusToken || "USD").toUpperCase();
      if (token === "USD") {
        prizePool = `$${formattedNum}`;
      } else if (token === "INR") {
        prizePool = `₹${formattedNum}`;
      } else {
        prizePool = `${formattedNum} ${token}`;
      }
    } else {
      prizePool = extractPrizePool(raw, String(raw.title || ""));
    }

    const tracks = detectTracks(String(raw.title || ""), String(raw.description || ""), raw);

    const formattedDescription = formatDescription(
      String(raw.description || ""),
      tracks,
      prizePool
    );

    const canonicalUrl = `https://dorahacks.io/hackathon/${raw.uname || raw.id}/`;

    return {
      title: String(raw.title).trim(),
      description: formattedDescription,
      startsAt: startsAtDate.toISOString(),
      endsAt: endsAtDate && !isNaN(endsAtDate.getTime()) ? endsAtDate.toISOString() : undefined,
      locationType,
      locationName: rawLocationName,
      sourceId: String(raw.id),
      sourcePlatform: "dorahacks",
      canonicalUrl,
      imageUrl: raw.imageUrl ? String(raw.imageUrl).trim() : undefined,
      rawSourcePayload: raw,
    };
  }
}
