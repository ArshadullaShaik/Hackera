import axios from "axios";
import { Scraper } from "../../core/scraper.interface.js";
import { NormalizedHackathon } from "../../core/schema.js";
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

export class HackerEarthScraper implements Scraper {
  private readonly targetUrl = "https://www.hackerearth.com/chrome-extension/events/";
  private readonly detailConcurrency = 3;
  private readonly detailTimeout = 15000;

  async scrape(): Promise<NormalizedHackathon[]> {
    logger.info({ targetUrl: this.targetUrl }, "Starting HackerEarth scrape");

    let response: any;
    try {
      response = await axios.get(this.targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "application/json",
        },
        timeout: 15000,
      });
    } catch (error) {
      logger.error({ error: String(error) }, "Failed fetch for HackerEarth events API");
      throw new Error(`HackerEarth scrape failed: network error - ${error instanceof Error ? error.message : String(error)}`);
    }

    const events = response.data?.response || [];
    logger.info({ rawCount: events.length }, "Found raw HackerEarth events");

    const hackathons: NormalizedHackathon[] = [];

    for (const raw of events) {
      try {
        const normalized = this.normalize(raw);
        if (normalized) {
          hackathons.push(normalized);
        }
      } catch (err) {
        logger.warn(
          { error: err instanceof Error ? err.message : String(err), title: raw.title },
          "Failed to normalize individual HackerEarth event"
        );
      }
    }

    const enrichedHackathons = await this.enrichHackathons(hackathons);

    logger.info({ count: enrichedHackathons.length }, "Completed HackerEarth scrape");
    return enrichedHackathons;
  }

  private normalize(raw: any): NormalizedHackathon | null {
    if (!raw.title || !raw.url) {
      return null;
    }

    // Determine unique sourceId from URL or title
    const urlParts = raw.url.replace(/\/$/, "").split("/");
    const sourceId = urlParts[urlParts.length - 1] || raw.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    let startsAt = new Date().toISOString();
    if (raw.start_utc_tz || raw.start_tz) {
      const parsed = new Date(raw.start_utc_tz || raw.start_tz);
      if (!isNaN(parsed.getTime())) {
        startsAt = parsed.toISOString();
      }
    }

    let endsAt: string | undefined = undefined;
    if (raw.end_utc_tz || raw.end_tz) {
      const parsed = new Date(raw.end_utc_tz || raw.end_tz);
      if (!isNaN(parsed.getTime())) {
        endsAt = parsed.toISOString();
      }
    }

    const imageUrl = raw.cover_image || raw.thumbnail || undefined;
    const locationType = determineLocationType({
      locationName: raw.location,
      isOnline: !raw.location,
    });

    const rawDesc = raw.description || "HackerEarth Challenge/Hackathon";
    const prizePool = extractPrizePool(raw, raw.title);
    const tracks = detectTracks(raw.title, rawDesc, raw);
    const description = formatDescription(rawDesc, tracks, prizePool);

    return {
      title: raw.title,
      description,
      startsAt,
      endsAt,
      locationType,
      locationName: raw.location || undefined,
      sourceId: String(sourceId),
      sourcePlatform: "hackerearth",
      canonicalUrl: raw.url,
      imageUrl: imageUrl && imageUrl.startsWith("http") ? imageUrl : undefined,
      rawSourcePayload: raw,
    };
  }

  private async enrichHackathons(hackathons: NormalizedHackathon[]): Promise<NormalizedHackathon[]> {
    return mapWithConcurrency(hackathons, this.detailConcurrency, (hackathon) => this.enrichHackathon(hackathon));
  }

  private async enrichHackathon(hackathon: NormalizedHackathon): Promise<NormalizedHackathon> {
    try {
      const detailPayload = await fetchDetailPayload(hackathon.canonicalUrl, this.detailTimeout);
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
        "HackerEarth detail enrichment failed; preserving list record"
      );
      return hackathon;
    }
  }
}
