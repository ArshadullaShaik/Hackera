import axios from "axios";
import { logger } from "../../core/logger.js";
import { determineLocationType, detectTracks, extractPrizePool, formatDescription, } from "../../core/enrichment.js";
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
                        Accept: "*/*",
                        "Accept-Language": "en-US,en;q=0.9",
                        Referer: "https://devpost.com/hackathons",
                        "Sec-Fetch-Dest": "empty",
                        "Sec-Fetch-Mode": "cors",
                        "Sec-Fetch-Site": "same-origin",
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
        const locName = raw.displayed_location?.location || undefined;
        const locationType = determineLocationType({
            locationName: locName,
            isOnline: locName?.toLowerCase().includes("online") || locName?.toLowerCase().includes("virtual"),
        });
        const { startsAt, endsAt } = this.parseSubmissionDates(raw.submission_period_dates);
        let imageUrl = raw.thumbnail_url;
        if (imageUrl && imageUrl.startsWith("//")) {
            imageUrl = `https:${imageUrl}`;
        }
        const prizePool = extractPrizePool(raw, raw.prize_amount || raw.title);
        const tracks = detectTracks(raw.title, raw.organization_name || "", raw);
        const description = formatDescription(`Devpost Hackathon by ${raw.organization_name || "Community"}.`, tracks, prizePool);
        return {
            title: raw.title,
            description,
            startsAt,
            endsAt,
            locationType,
            locationName: locName,
            sourceId: String(raw.id),
            sourcePlatform: "devpost",
            canonicalUrl: raw.url,
            imageUrl: imageUrl && imageUrl.startsWith("http") ? imageUrl : undefined,
            rawSourcePayload: raw,
        };
    }
    parseSubmissionDates(dateRange) {
        const fallback = { startsAt: new Date().toISOString() };
        if (typeof dateRange !== "string")
            return fallback;
        const match = dateRange.match(/^([A-Za-z]+\s+\d{1,2})(?:,\s*(\d{4}))?\s*-\s*([A-Za-z]+\s+\d{1,2}),\s*(\d{4})$/);
        if (!match)
            return fallback;
        const [, startDay, explicitStartYear, endDay, endYear] = match;
        const end = new Date(`${endDay}, ${endYear} UTC`);
        const start = new Date(`${startDay}, ${explicitStartYear || endYear} UTC`);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
            return fallback;
        if (!explicitStartYear && start > end)
            start.setFullYear(start.getFullYear() - 1);
        return { startsAt: start.toISOString(), endsAt: end.toISOString() };
    }
}
//# sourceMappingURL=devpost.scraper.js.map