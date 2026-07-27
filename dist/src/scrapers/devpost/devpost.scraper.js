import axios from "axios";
import { logger } from "../../core/logger.js";
export class DevpostScraper {
    constructor() {
        this.baseUrl = "https://devpost.com/api/hackathons";
        this.maxPages = 3;
    }
    async scrape() {
        logger.info({ baseUrl: this.baseUrl }, "Starting Devpost scrape");
        const allRawItems = [];
        for (let page = 1; page <= this.maxPages; page++) {
            try {
                const response = await axios.get(this.baseUrl, {
                    params: {
                        "status[]": ["upcoming", "open"],
                        page,
                    },
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        Accept: "application/json",
                    },
                    timeout: 15000,
                });
                const items = response.data?.hackathons || [];
                allRawItems.push(...items);
                if (items.length === 0) {
                    break;
                }
            }
            catch (error) {
                if (page === 1) {
                    logger.error({ error: String(error) }, "Failed envelope-level fetch for Devpost API");
                    throw new Error(`Devpost scrape failed: network error - ${error instanceof Error ? error.message : String(error)}`);
                }
                logger.warn({ page, error: String(error) }, "Error fetching Devpost page, stopping pagination");
                break;
            }
        }
        logger.info({ rawCount: allRawItems.length }, "Found raw Devpost hackathons");
        const hackathons = [];
        for (const raw of allRawItems) {
            try {
                const normalized = this.normalize(raw);
                if (normalized) {
                    hackathons.push(normalized);
                }
            }
            catch (err) {
                logger.warn({ error: err instanceof Error ? err.message : String(err), rawId: raw.id || raw.title }, "Failed to normalize individual Devpost hackathon");
            }
        }
        logger.info({ count: hackathons.length }, "Completed Devpost scrape");
        return hackathons;
    }
    normalize(raw) {
        if (!raw.title || !raw.id || !raw.url) {
            return null;
        }
        let locationType = "in-person";
        const loc = raw.displayed_location?.location?.toLowerCase() || "";
        if (loc.includes("online") || loc.includes("virtual") || raw.displayed_location?.icon === "globe") {
            locationType = "online";
        }
        let startsAt = new Date().toISOString(); // Default to current date if submission dates require parsing
        const dateRange = raw.submission_period_dates || "";
        if (dateRange) {
            // Devpost gives strings like "May 19 - Aug 17, 2026" or "Jun 30 - Aug 18, 2026"
            const match = dateRange.match(/([A-Za-z]+\s+\d+).*?(\d{4})/);
            if (match) {
                const parsed = new Date(`${match[1]}, ${match[2]}`);
                if (!isNaN(parsed.getTime())) {
                    startsAt = parsed.toISOString();
                }
            }
        }
        let imageUrl = raw.thumbnail_url;
        if (imageUrl && imageUrl.startsWith("//")) {
            imageUrl = `https:${imageUrl}`;
        }
        return {
            title: raw.title,
            description: `Devpost Hackathon by ${raw.organization_name || "Community"}. ${raw.prize_amount ? `Prizes: ${raw.prize_amount.replace(/<[^>]*>?/gm, "")}` : ""}`.trim(),
            startsAt,
            locationType,
            locationName: raw.displayed_location?.location || undefined,
            sourceId: String(raw.id),
            sourcePlatform: "devpost",
            canonicalUrl: raw.url,
            imageUrl: imageUrl && imageUrl.startsWith("http") ? imageUrl : undefined,
            rawSourcePayload: raw,
        };
    }
}
//# sourceMappingURL=devpost.scraper.js.map