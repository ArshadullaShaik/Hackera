import { z } from "zod";
/**
 * Normalized hackathon event schema.
 * This is the canonical shape that all scrapers must map to.
 * Raw source-specific fields remain in `rawSourcePayload`.
 */
export const NormalizedHackathonSchema = z.object({
    // Canonical fields
    title: z.string().min(1),
    description: z.string().optional().default(""),
    startsAt: z.string().datetime({ offset: true }), // ISO 8601 datetime with optional timezone
    endsAt: z.string().datetime({ offset: true }).optional(),
    // Location
    locationType: z.enum(["in-person", "online", "hybrid"]),
    locationName: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    // Source tracking
    sourceId: z.string(), // ID from the source platform
    sourcePlatform: z.enum(["luma", "devfolio", "devpost", "mlh", "unstop", "hackerearth", "hackclub", "other"]),
    canonicalUrl: z.string().url(),
    // Metadata
    imageUrl: z.string().url().optional(),
    // Always preserve raw payload for debugging and unmapped fields
    rawSourcePayload: z.record(z.unknown()),
});
//# sourceMappingURL=schema.js.map