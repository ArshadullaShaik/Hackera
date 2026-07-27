import axios from "axios";
import { Scraper } from "../../core/scraper.interface.js";
import { NormalizedHackathon } from "../../core/schema.js";
import { logger } from "../../core/logger.js";

export class HackClubScraper implements Scraper {
  private readonly targetUrl = "https://hackathons.hackclub.com/api/events/upcoming";

  async scrape(): Promise<NormalizedHackathon[]> {
    logger.info({ targetUrl: this.targetUrl }, "Starting Hack Club scrape");

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
      logger.error({ error: String(error) }, "Failed fetch for Hack Club events API");
      throw new Error(`Hack Club scrape failed: network error - ${error instanceof Error ? error.message : String(error)}`);
    }

    const events = Array.isArray(response.data) ? response.data : response.data?.events || [];
    logger.info({ rawCount: events.length }, "Found raw Hack Club events");

    const hackathons: NormalizedHackathon[] = [];

    for (const raw of events) {
      try {
        const normalized = this.normalize(raw);
        if (normalized) {
          hackathons.push(normalized);
        }
      } catch (err) {
        logger.warn(
          { error: err instanceof Error ? err.message : String(err), id: raw.id || raw.title || raw.name },
          "Failed to normalize individual Hack Club event"
        );
      }
    }

    logger.info({ count: hackathons.length }, "Completed Hack Club scrape");
    return hackathons;
  }

  private normalize(raw: any): NormalizedHackathon | null {
    const title = raw.title || raw.name;
    if (!title) {
      return null;
    }

    const sourceId = String(raw.id || raw.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"));

    let startsAt = new Date().toISOString();
    if (raw.start || raw.startsAt || raw.start_date) {
      const parsed = new Date(raw.start || raw.startsAt || raw.start_date);
      if (!isNaN(parsed.getTime())) {
        if (parsed.getFullYear() < 2025) {
          return null; // Skip events before 2025
        }
        startsAt = parsed.toISOString();
      }
    }

    let endsAt: string | undefined = undefined;
    if (raw.end || raw.endsAt || raw.end_date) {
      const parsed = new Date(raw.end || raw.endsAt || raw.end_date);
      if (!isNaN(parsed.getTime())) {
        endsAt = parsed.toISOString();
      }
    }

    let locationType: "in-person" | "online" | "hybrid" = "in-person";
    if (raw.virtual || raw.online || raw.hybrid === false || raw.city?.toLowerCase().includes("online")) {
      locationType = "online";
    }

    let canonicalUrl = raw.website || raw.url || `https://hackathons.hackclub.com/`;
    if (!canonicalUrl.startsWith("http")) {
      canonicalUrl = `https://${canonicalUrl}`;
    }

    const locationName = [raw.city, raw.state, raw.country].filter(Boolean).join(", ") || undefined;

    return {
      title,
      description: raw.description || `Hack Club event in ${locationName || "online"}`,
      startsAt,
      endsAt,
      locationType,
      locationName,
      sourceId,
      sourcePlatform: "hackclub",
      canonicalUrl,
      imageUrl: raw.banner || raw.logo || raw.bg_image || undefined,
      rawSourcePayload: raw,
    };
  }
}
