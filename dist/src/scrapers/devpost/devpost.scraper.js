import axios from "axios";
import { logger } from "../../core/logger.js";
import { determineLocationType, detectTracks, extractPrizePool, formatDescription, } from "../../core/enrichment.js";
export class DevpostScraper {
    constructor() {
        this.baseUrl = "https://devpost.com/api/hackathons";
    }
    async scrape() {
        logger.info({ baseUrl: this.baseUrl }, "Starting Devpost scrape");
        const allRawItems = [];
        let totalPages = 1;
        for (let page = 1; page <= totalPages; page++) {
            try {
                const response = await axios.get(this.baseUrl, {
                    params: {
                        order_by: "recently-added",
                        "status[]": ["upcoming", "open"],
                        page,
                    },
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                        Accept: "application/json, text/plain, */*",
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
                const totalCount = response.data?.meta?.total_count;
                const perPage = response.data?.meta?.per_page;
                if (page === 1 && Number.isFinite(totalCount) && Number.isFinite(perPage) && perPage > 0) {
                    totalPages = Math.ceil(totalCount / perPage);
                }
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
        let startsAt = new Date().toISOString();
        let endsAt;
        const dateRange = raw.submission_period_dates || "";
        if (dateRange) {
            const parts = dateRange.split(" - ");
            const yearMatch = dateRange.match(/\d{4}\s*$/);
            const year = yearMatch?.[0]?.trim();
            const startMonth = parts[0]?.match(/[A-Za-z]+/)?.[0];
            if (parts.length === 2 && year && startMonth) {
                const startStr = /\d{4}/.test(parts[0]) ? parts[0] : `${parts[0]}, ${year}`;
                const endStr = /^[A-Za-z]/.test(parts[1].trim()) ? parts[1] : `${startMonth} ${parts[1]}`;
                const pStart = new Date(`${startStr} UTC`);
                if (!isNaN(pStart.getTime()))
                    startsAt = pStart.toISOString();
                const pEnd = new Date(`${endStr} UTC`);
                if (!isNaN(pEnd.getTime())) {
                    if (pStart > pEnd)
                        pStart.setUTCFullYear(pStart.getUTCFullYear() - 1);
                    startsAt = pStart.toISOString();
                    pEnd.setUTCHours(23, 59, 59, 999);
                    endsAt = pEnd.toISOString();
                }
            }
            else if (parts.length === 1) {
                const pStart = new Date(`${parts[0]} UTC`);
                if (!isNaN(pStart.getTime())) {
                    startsAt = pStart.toISOString();
                    pStart.setUTCHours(23, 59, 59, 999);
                    endsAt = pStart.toISOString();
                }
            }
        }
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
}
//# sourceMappingURL=devpost.scraper.js.map