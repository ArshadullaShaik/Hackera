import { z } from "zod";
import axios from "axios";
import * as cheerio from "cheerio";
import { Scraper } from "../../core/scraper.interface.js";
import {
  NormalizedHackathon,
  NormalizedHackathonSchema,
} from "../../core/schema.js";
import { logger } from "../../core/logger.js";
import {
  determineLocationType,
  detectTracks,
  extractPrizePool,
  formatDescription,
} from "../../core/enrichment.js";
import {
  extractDetailDates,
  fetchDetailPayload,
  mapWithConcurrency,
  mergeRawSourcePayload,
} from "../../core/detail-enrichment.js";

/**
 * Raw Devfolio hackathon schema
 * Extracted from embedded JSON in devfolio.co/hackathons HTML
 */
const DevfolioRawHackathonSchema = z.object({
  uuid: z.string(),
  slug: z.string(),
  name: z.string(),
  type: z.string().optional().catch("HACKATHON"),
  starts_at: z.string(), // ISO 8601 datetime
  ends_at: z.string().optional().nullable(),
  is_online: z.boolean().optional().default(false),
  rating: z.number().optional().default(0),
  timezone: z.string().optional(),
  participants_count: z.number().optional().default(0),
  themes: z.array(z.object({ theme: z.object({ name: z.string() }) })).optional().default([]),
  settings: z.object({
    site: z.string().url().optional().nullable(),
    twitter: z.string().optional().nullable(),
    discord: z.string().optional().nullable(),
  }).optional().nullable(),
});

type DevfolioRawHackathon = z.infer<typeof DevfolioRawHackathonSchema>;

/**
 * Raw response structure from HTML page (Next.js dehydrated state)
 */
const DevfolioRawResponseSchema = z.object({
  open_hackathons: z.array(z.unknown()).optional(),
  upcoming_hackathons: z.array(z.unknown()).optional(),
  past_hackathons: z.array(z.unknown()).optional(),
});

export class DevfolioScraper implements Scraper {
  private readonly BASE_URL = "https://devfolio.co/hackathons";
  private readonly TIMEOUT = 15000; // 15 seconds for rendering
  private readonly MAX_EVENTS = 100; // Limit for Phase 2 validation
  private readonly DETAIL_CONCURRENCY = 3;

  async scrape(): Promise<NormalizedHackathon[]> {
    const results: NormalizedHackathon[] = [];

    try {
      logger.debug("Fetching Devfolio hackathons page");

      const response = await axios.get(this.BASE_URL, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
        timeout: this.TIMEOUT,
      });

      // Parse HTML and extract embedded JSON
      const $ = cheerio.load(response.data);

      // Look for scripts containing JSON data
      // Devfolio embeds the data in a script tag as a JSON object
      const scripts = $("script");
      let hackathonData: any = null;

      logger.debug(`Found ${scripts.length} script tags`);

      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        const content = $(script).html();
        if (content) {
          const preview = content.substring(0, 200);
          logger.debug({ scriptIndex: i, preview }, "Script content preview");

          if (content.includes("upcoming") || content.includes("hackathon")) {
            try {
              // Try multiple patterns to extract JSON
              let jsonStr: string | null = null;

              // Pattern 1: Direct object assignment
              let match = content.match(/window\.\w+\s*=\s*(\{[\s\S]*?\});/);
              if (match) {
                jsonStr = match[1];
              }

              // Pattern 2: Just raw JSON
              if (!jsonStr) {
                match = content.match(/^(\{[\s\S]*\})$/);
                if (match) {
                  jsonStr = match[1];
                }
              }

              // Pattern 3: JSON followed by script close
              if (!jsonStr) {
                match = content.match(/(\{[\s\S]*"upcoming[\s\S]*?\})\s*$/);
                if (match) {
                  jsonStr = match[1];
                }
              }

              if (jsonStr) {
                logger.debug(`Attempting to parse JSON from script ${i}`);
                hackathonData = JSON.parse(jsonStr);
                logger.debug(
                  {
                    keys: Object.keys(hackathonData || {}),
                  },
                  "Parsed JSON structure"
                );

                if (hackathonData && hackathonData.upcoming_hackathons) {
                  logger.debug("Found upcoming_hackathons key!");
                  break;
                }
              }
            } catch (e) {
              logger.debug({
                error: e instanceof Error ? e.message : String(e),
                scriptIndex: i,
              });
            }
          }
        }
      }

      if (!hackathonData) {
        logger.error("Could not find hackathon data in page HTML");
        throw new Error("Devfolio page structure changed: no hackathon data found");
      }

      // Devfolio uses Next.js dehydrated state - extract the actual data
      let hackathons: any[] = [];

      // Navigate the dehydrated state structure
      if (hackathonData.props?.pageProps?.dehydratedState?.queries?.[0]?.state?.data) {
        const data = hackathonData.props.pageProps.dehydratedState.queries[0].state.data;
        hackathons = [
          ...(data.open_hackathons || []),
          ...(data.upcoming_hackathons || []),
          ...(data.past_hackathons || []),
        ];
        logger.debug(
          { hackathonCount: hackathons.length },
          "Extracted hackathons from dehydrated state"
        );
      } else if (hackathonData.open_hackathons || hackathonData.upcoming_hackathons) {
        // Fallback for simpler structure
        hackathons = [
          ...(hackathonData.open_hackathons || []),
          ...(hackathonData.upcoming_hackathons || []),
          ...(hackathonData.past_hackathons || []),
        ];
        logger.debug(
          { hackathonCount: hackathons.length },
          "Extracted hackathons from top-level keys"
        );
      }

      if (hackathons.length === 0) {
        logger.error(
          { dataKeys: Object.keys(hackathonData) },
          "Found JSON but no hackathon arrays"
        );
        throw new Error(
          "Devfolio data found but no hackathon arrays in expected location"
        );
      }

      // Validate individual hackathons
      const envelopeData = { open_hackathons: hackathons };

      logger.info(
        { eventCount: hackathons.length },
        "Devfolio hackathons found"
      );

      // Process individual hackathons (fail-soft)
      let processedCount = 0;
      for (const rawHackathon of hackathons) {
        if (processedCount >= this.MAX_EVENTS) {
          logger.info(
            { maxEvents: this.MAX_EVENTS },
            "Reached maximum event limit for Phase 2"
          );
          break;
        }

        try {
          const validated = DevfolioRawHackathonSchema.parse(rawHackathon);
          const normalized = this.mapToNormalized(validated, rawHackathon);
          results.push(normalized);
          processedCount++;
        } catch (error) {
          logger.warn(
            {
              error: error instanceof Error ? error.message : String(error),
              rawHackathon,
            },
            "Skipping invalid Devfolio entry (fail-soft)"
          );
          // Continue processing other hackathons
        }
      }

      const enrichedResults = await this.enrichHackathons(results);

      logger.info({ totalEvents: enrichedResults.length }, "Devfolio scraping complete");
      return enrichedResults;
    } catch (error) {
      // Fail-fast at envelope level
      logger.error(
        { error: error instanceof Error ? error.message : String(error) },
        "Devfolio scraper failed at envelope level"
      );
      throw error;
    }
  }

  private mapToNormalized(
    raw: DevfolioRawHackathon,
    rawPayload: unknown
  ): NormalizedHackathon {
    const locationType = determineLocationType({
      isOnline: raw.is_online,
    });

    const canonicalUrl = `https://devfolio.co/${raw.slug}`;

    const themesStr = raw.themes?.map((t) => t.theme?.name).filter(Boolean).join(", ");
    const prizePool = extractPrizePool(raw, raw.name);
    const tracks = detectTracks(raw.name, themesStr || "", raw);
    const description = formatDescription(
      themesStr ? `Devfolio Hackathon featuring ${themesStr}` : "Devfolio Hackathon",
      tracks,
      prizePool
    );

    return NormalizedHackathonSchema.parse({
      title: raw.name,
      description,
      startsAt: raw.starts_at,
      endsAt: raw.ends_at || undefined,
      locationType,
      locationName: undefined,
      sourceId: raw.uuid,
      sourcePlatform: "devfolio",
      canonicalUrl,
      imageUrl: undefined,
      rawSourcePayload: rawPayload,
    });
  }

  private async enrichHackathons(hackathons: NormalizedHackathon[]): Promise<NormalizedHackathon[]> {
    return mapWithConcurrency(hackathons, this.DETAIL_CONCURRENCY, (hackathon) => this.enrichHackathon(hackathon));
  }

  private async enrichHackathon(hackathon: NormalizedHackathon): Promise<NormalizedHackathon> {
    try {
      const detailPayload = await fetchDetailPayload(hackathon.canonicalUrl, this.TIMEOUT);
      const detailDates = extractDetailDates(detailPayload);

      return {
        ...hackathon,
        ...detailDates,
        rawSourcePayload: mergeRawSourcePayload(hackathon.rawSourcePayload, detailPayload),
      };
    } catch (error) {
      logger.warn(
        {
          error: error instanceof Error ? error.message : String(error),
          url: hackathon.canonicalUrl,
          sourceId: hackathon.sourceId,
        },
        "Devfolio detail enrichment failed; preserving list record"
      );
      return hackathon;
    }
  }
}
