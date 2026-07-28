import axios from "axios";
import * as cheerio from "cheerio";
import { logger } from "../../core/logger.js";
import { determineLocationType, detectTracks, extractPrizePool, formatDescription, } from "../../core/enrichment.js";
export class MLHScraper {
    constructor() {
        this.targetUrl = "https://mlh.io/seasons/2026/events";
    }
    async scrape() {
        logger.info({ url: this.targetUrl }, "Starting MLH scrape");
        let html;
        try {
            const response = await axios.get(this.targetUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                },
                timeout: 15000,
            });
            html = response.data;
        }
        catch (error) {
            logger.error({ error: error instanceof Error ? error.message : String(error) }, "MLH network fetch failed");
            throw new Error(`MLH scrape failed: network error - ${error instanceof Error ? error.message : String(error)}`);
        }
        const $ = cheerio.load(html);
        const scriptText = $('script[data-page="app"]').html();
        if (!scriptText) {
            logger.error("MLH page missing data-page app script element");
            throw new Error("MLH scrape failed: could not locate embedded JSON payload");
        }
        let payload;
        try {
            payload = JSON.parse(scriptText);
        }
        catch (error) {
            logger.error({ error: String(error) }, "Failed to parse MLH embedded JSON");
            throw new Error("MLH scrape failed: invalid JSON in page source");
        }
        const upcoming = payload?.props?.upcomingEvents || [];
        const past = payload?.props?.pastEvents || [];
        const rawEvents = [...upcoming, ...past];
        logger.info({ rawCount: rawEvents.length }, "Found raw MLH events");
        const hackathons = [];
        for (const raw of rawEvents) {
            try {
                const normalized = this.normalize(raw);
                if (normalized) {
                    hackathons.push(normalized);
                }
            }
            catch (err) {
                logger.warn({ error: err instanceof Error ? err.message : String(err), rawId: raw.id || raw.name }, "Failed to normalize individual MLH event");
            }
        }
        logger.info({ count: hackathons.length }, "Completed MLH scrape");
        return hackathons;
    }
    normalize(raw) {
        if (!raw.name || !raw.id || !raw.startsAt) {
            return null;
        }
        const startDate = new Date(raw.startsAt);
        if (isNaN(startDate.getTime()) || startDate.getFullYear() < 2025) {
            return null; // Skip events prior to 2025
        }
        const locationType = determineLocationType({
            formatType: raw.formatType,
            locationName: raw.location,
        });
        let canonicalUrl = raw.websiteUrl || (raw.url ? `https://mlh.io${raw.url}` : `https://mlh.io/events/${raw.slug}`);
        if (!canonicalUrl.startsWith("http")) {
            canonicalUrl = `https://mlh.io${canonicalUrl}`;
        }
        const rawDesc = raw.location ? `MLH Season Event in ${raw.location}` : "MLH Season Hackathon";
        const prizePool = extractPrizePool(raw, raw.name);
        const tracks = detectTracks(raw.name, rawDesc, raw);
        const description = formatDescription(rawDesc, tracks, prizePool);
        return {
            title: raw.name,
            description,
            startsAt: new Date(raw.startsAt).toISOString(),
            endsAt: raw.endsAt ? new Date(raw.endsAt).toISOString() : undefined,
            locationType,
            locationName: raw.location || undefined,
            sourceId: String(raw.id),
            sourcePlatform: "mlh",
            canonicalUrl,
            imageUrl: raw.backgroundUrl || raw.logoUrl || undefined,
            rawSourcePayload: raw,
        };
    }
}
//# sourceMappingURL=mlh.scraper.js.map