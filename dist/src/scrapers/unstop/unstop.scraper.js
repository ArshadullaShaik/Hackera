import axios from "axios";
import { logger } from "../../core/logger.js";
export class UnstopScraper {
    constructor() {
        this.baseUrl = "https://unstop.com/api/public/opportunity/search-new";
        this.maxPages = 3;
    }
    async scrape() {
        logger.info({ baseUrl: this.baseUrl }, "Starting Unstop scrape");
        const allRawItems = [];
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
            }
            catch (error) {
                if (page === 1) {
                    logger.error({ error: String(error) }, "Failed envelope-level fetch for Unstop API");
                    throw new Error(`Unstop scrape failed: network error - ${error instanceof Error ? error.message : String(error)}`);
                }
                logger.warn({ page, error: String(error) }, "Error fetching Unstop page, stopping pagination");
                break;
            }
        }
        logger.info({ rawCount: allRawItems.length }, "Found raw Unstop hackathons");
        const hackathons = [];
        for (const raw of allRawItems) {
            try {
                const normalized = this.normalize(raw);
                if (normalized) {
                    hackathons.push(normalized);
                }
            }
            catch (err) {
                logger.warn({ error: err instanceof Error ? err.message : String(err), rawId: raw.id || raw.title }, "Failed to normalize individual Unstop hackathon");
            }
        }
        logger.info({ count: hackathons.length }, "Completed Unstop scrape");
        return hackathons;
    }
    normalize(raw) {
        if (!raw.title || !raw.id || !raw.start_date) {
            return null;
        }
        let locationType = "in-person";
        if (raw.region === "online" || !raw.address_with_country_logo?.city) {
            locationType = "online";
        }
        const city = raw.address_with_country_logo?.city;
        const state = raw.address_with_country_logo?.state;
        const country = raw.address_with_country_logo?.country?.name;
        const locationParts = [city, state, country].filter(Boolean);
        const locationName = locationParts.length > 0 ? locationParts.join(", ") : undefined;
        let canonicalUrl = raw.seo_url || (raw.public_url ? `https://unstop.com/${raw.public_url}` : `https://unstop.com/hackathons/${raw.short_id}`);
        if (!canonicalUrl.startsWith("http")) {
            canonicalUrl = `https://unstop.com/${canonicalUrl.replace(/^\//, "")}`;
        }
        const imageUrl = raw.banner_mobile?.image_url || raw.logoUrl2 || undefined;
        return {
            title: raw.title,
            description: raw.seo_details?.[0]?.description || raw.details?.replace(/<[^>]*>?/gm, "").slice(0, 300) || "Hackathon hosted on Unstop",
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
}
//# sourceMappingURL=unstop.scraper.js.map