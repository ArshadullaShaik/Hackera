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

export class UnstopScraper implements Scraper {
  private readonly baseUrl = "https://unstop.com/api/public/opportunity/search-new";
  private readonly maxPages = 3;
  private readonly detailConcurrency = 3;
  private readonly detailTimeout = 15000;

  async scrape(): Promise<NormalizedHackathon[]> {
    logger.info({ baseUrl: this.baseUrl }, "Starting Unstop scrape");

    const allRawItems: any[] = [];

    for (let page = 1; page <= this.maxPages; page++) {
      try {
        const response = await axios.get(this.baseUrl, {
          params: {
            opportunity: "hackathons",
            per_page: 20,
            oppstatus: "open",
            page,
          },
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "application/json",
          },
          timeout: 15000,
        });

        const items = response.data?.data?.data || [];
        allRawItems.push(...items);

        if (items.length < 20) {
          break; // No more pages
        }
      } catch (error) {
        if (page === 1) {
          logger.error({ error: String(error) }, "Failed envelope-level fetch for Unstop API");
          throw new Error(`Unstop scrape failed: network error - ${error instanceof Error ? error.message : String(error)}`);
        }
        logger.warn({ page, error: String(error) }, "Error fetching Unstop page, stopping pagination");
        break;
      }
    }

    logger.info({ rawCount: allRawItems.length }, "Found raw Unstop hackathons");

    const hackathons: NormalizedHackathon[] = [];

    for (const raw of allRawItems) {
      try {
        const normalized = this.normalize(raw);
        if (normalized) {
          hackathons.push(normalized);
        }
      } catch (err) {
        logger.warn(
          { error: err instanceof Error ? err.message : String(err), rawId: raw.id || raw.title },
          "Failed to normalize individual Unstop hackathon"
        );
      }
    }

    const enrichedHackathons = await this.enrichHackathons(hackathons);

    logger.info({ count: enrichedHackathons.length }, "Completed Unstop scrape");
    return enrichedHackathons;
  }

  private normalize(raw: any): NormalizedHackathon | null {
    if (!raw.title || !raw.id || !raw.start_date) {
      return null;
    }

    const city = raw.address_with_country_logo?.city;
    const state = raw.address_with_country_logo?.state;
    const country = raw.address_with_country_logo?.country?.name;
    const locationParts = [city, state, country].filter(Boolean);
    const locationName = locationParts.length > 0 ? locationParts.join(", ") : undefined;

    const locationType = determineLocationType({
      region: raw.region,
      locationName,
      city,
      country,
    });

    let canonicalUrl = raw.seo_url || (raw.public_url ? `https://unstop.com/${raw.public_url}` : `https://unstop.com/hackathons/${raw.short_id}`);
    if (!canonicalUrl.startsWith("http")) {
      canonicalUrl = `https://unstop.com/${canonicalUrl.replace(/^\//, "")}`;
    }

    const imageUrl = raw.banner_mobile?.image_url || raw.logoUrl2 || undefined;

    const rawDesc = raw.seo_details?.[0]?.description || raw.details?.replace(/<[^>]*>?/gm, "").slice(0, 300) || "Hackathon hosted on Unstop";
    const prizePool = extractPrizePool(raw, rawDesc || raw.title);
    const tracks = detectTracks(raw.title, rawDesc, raw);
    const description = formatDescription(rawDesc, tracks, prizePool);

    return {
      title: raw.title,
      description,
      startsAt: new Date(raw.start_date).toISOString(),
      endsAt: raw.end_date ? new Date(raw.end_date).toISOString() : undefined,
      locationType,
      locationName,
      sourceId: String(raw.id),
      sourcePlatform: "unstop",
      canonicalUrl,
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
        "Unstop detail enrichment failed; preserving list record"
      );
      return hackathon;
    }
  }
}
