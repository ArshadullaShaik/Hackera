import { z } from "zod";
import axios from "axios";
import { NormalizedHackathonSchema, } from "../../core/schema.js";
import { logger } from "../../core/logger.js";
import { determineLocationType, detectTracks, extractPrizePool, formatDescription, } from "../../core/enrichment.js";
import { extractDetailDates, fetchDetailPayload, mapWithConcurrency, mergeRawSourcePayload, } from "../../core/detail-enrichment.js";
/**
 * Raw Luma API event schema
 * These field names and shapes come directly from the Luma API response.
 */
const LumaRawEventSchema = z.object({
    api_id: z.string(),
    name: z.string(),
    description: z.string().optional().nullable(),
    cover_url: z.string().optional().nullable(),
    start_at: z.string(), // ISO 8601 datetime string
    end_at: z.string().optional().nullable(),
    geo_address_info: z.object({
        city: z.string().optional().nullable(),
        country: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
        full_address: z.string().optional().nullable(),
    }).optional().nullable(),
    event_type: z.string().optional().catch("other"),
    url: z.string(), // This is a slug; we'll construct full URL
    location_type: z.enum(["offline", "virtual", "hybrid"]).optional().catch("offline"),
    coordinate: z.object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
    }).optional().nullable(),
});
/**
 * Raw Luma API response schema
 */
const LumaRawResponseSchema = z.object({
    entries: z.array(z.unknown()),
    next_cursor: z.string().optional().nullable(),
});
export class LumaScraper {
    constructor() {
        this.BASE_URL = "https://api.luma.com/discover/get-paginated-events";
        this.DISCOVER_PLACE_ID = "discplace-G0tGUVYwl7T17Sb";
        this.PAGINATION_LIMIT = 25;
        this.TIMEOUT = 10000; // 10 seconds
        this.MAX_PAGES = 5; // Limit pagination for Phase 1 validation
        this.DETAIL_CONCURRENCY = 3;
    }
    async scrape() {
        const results = [];
        let nextCursor = null;
        let pageCount = 0;
        try {
            // Paginate through results
            while (pageCount < this.MAX_PAGES) {
                logger.debug({ cursor: nextCursor, page: pageCount }, "Fetching Luma page");
                const response = await axios.get(this.BASE_URL, {
                    params: {
                        discover_place_api_id: this.DISCOVER_PLACE_ID,
                        pagination_limit: this.PAGINATION_LIMIT,
                        ...(nextCursor && { pagination_cursor: nextCursor }),
                    },
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        Accept: "application/json",
                    },
                    timeout: this.TIMEOUT,
                });
                // Validate envelope
                const envelopeValidation = LumaRawResponseSchema.safeParse(response.data);
                if (!envelopeValidation.success) {
                    logger.error({ error: envelopeValidation.error }, "Invalid Luma API response envelope (fail-fast)");
                    throw new Error(`Luma API response validation failed: ${envelopeValidation.error.message}`);
                }
                const envelope = envelopeValidation.data;
                logger.info({ eventCount: envelope.entries.length, nextCursor: envelope.next_cursor }, "Luma API response received");
                // Process individual events (fail-soft)
                for (const entry of envelope.entries) {
                    try {
                        // Extract the event from the entry structure
                        const entryObj = entry;
                        const rawEvent = entryObj.event || entry;
                        const validated = LumaRawEventSchema.parse(rawEvent);
                        const normalized = this.mapToNormalized(validated, rawEvent);
                        results.push(normalized);
                    }
                    catch (error) {
                        logger.warn({ error: error instanceof Error ? error.message : String(error), entry }, "Skipping invalid Luma entry (fail-soft)");
                        // Continue processing other events
                    }
                }
                // Check for next page
                if (!envelope.next_cursor) {
                    logger.debug("No more Luma pages");
                    break;
                }
                nextCursor = envelope.next_cursor;
                pageCount++;
            }
            if (pageCount >= this.MAX_PAGES) {
                logger.info({ maxPages: this.MAX_PAGES }, "Reached maximum page limit for Phase 1");
            }
            const enrichedResults = await this.enrichHackathons(results);
            logger.info({ totalEvents: enrichedResults.length }, "Luma scraping complete");
            return enrichedResults;
        }
        catch (error) {
            // Fail-fast at envelope level
            logger.error({ error: error instanceof Error ? error.message : String(error) }, "Luma scraper failed at envelope level");
            throw error;
        }
    }
    mapToNormalized(raw, rawPayload) {
        const address = raw.geo_address_info;
        let locationName;
        if (address) {
            locationName = address.full_address || address.address ||
                (address.city ? `${address.city}, ${address.country}` : undefined);
        }
        const locationType = determineLocationType({
            isVirtual: raw.location_type === "virtual",
            isHybrid: raw.location_type === "hybrid",
            locationName,
            city: address?.city || undefined,
            country: address?.country || undefined,
        });
        const startsAt = raw.start_at;
        const endsAt = raw.end_at || undefined;
        const canonicalUrl = `https://lu.ma/${raw.url}`;
        let latitude;
        let longitude;
        if (raw.coordinate) {
            latitude = raw.coordinate.latitude;
            longitude = raw.coordinate.longitude;
        }
        const rawDesc = raw.description || `Luma Hackathon Event`;
        const prizePool = extractPrizePool(raw, raw.name);
        const tracks = detectTracks(raw.name, rawDesc, raw);
        const description = formatDescription(rawDesc, tracks, prizePool);
        return NormalizedHackathonSchema.parse({
            title: raw.name,
            description,
            startsAt,
            endsAt,
            locationType,
            locationName,
            latitude,
            longitude,
            sourceId: raw.api_id,
            sourcePlatform: "luma",
            canonicalUrl,
            imageUrl: raw.cover_url,
            rawSourcePayload: rawPayload,
        });
    }
    async enrichHackathons(hackathons) {
        return mapWithConcurrency(hackathons, this.DETAIL_CONCURRENCY, (hackathon) => this.enrichHackathon(hackathon));
    }
    async enrichHackathon(hackathon) {
        try {
            const detailPayload = await fetchDetailPayload(hackathon.canonicalUrl, this.TIMEOUT);
            const detailDates = extractDetailDates(detailPayload);
            return {
                ...hackathon,
                ...detailDates,
                rawSourcePayload: mergeRawSourcePayload(hackathon.rawSourcePayload, detailPayload),
            };
        }
        catch (error) {
            logger.warn({
                error: error instanceof Error ? error.message : String(error),
                url: hackathon.canonicalUrl,
                sourceId: hackathon.sourceId,
            }, "Luma detail enrichment failed; preserving list record");
            return hackathon;
        }
    }
}
//# sourceMappingURL=luma.scraper.js.map