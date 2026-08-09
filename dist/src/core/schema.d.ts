import { z } from "zod";
/**
 * Normalized hackathon event schema.
 * This is the canonical shape that all scrapers must map to.
 * Raw source-specific fields remain in `rawSourcePayload`.
 */
export declare const NormalizedHackathonSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    startsAt: z.ZodString;
    endsAt: z.ZodOptional<z.ZodString>;
    locationType: z.ZodEnum<["in-person", "online", "hybrid"]>;
    locationName: z.ZodOptional<z.ZodString>;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
    sourceId: z.ZodString;
    sourcePlatform: z.ZodEnum<["luma", "devfolio", "devpost", "mlh", "unstop", "hackerearth", "hackclub", "other"]>;
    canonicalUrl: z.ZodString;
    imageUrl: z.ZodOptional<z.ZodString>;
    rawSourcePayload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    locationType: "in-person" | "online" | "hybrid";
    sourceId: string;
    sourcePlatform: "luma" | "devfolio" | "devpost" | "mlh" | "unstop" | "hackerearth" | "hackclub" | "other";
    title: string;
    description: string;
    startsAt: string;
    canonicalUrl: string;
    rawSourcePayload: Record<string, unknown>;
    endsAt?: string | undefined;
    locationName?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    imageUrl?: string | undefined;
}, {
    locationType: "in-person" | "online" | "hybrid";
    sourceId: string;
    sourcePlatform: "luma" | "devfolio" | "devpost" | "mlh" | "unstop" | "hackerearth" | "hackclub" | "other";
    title: string;
    startsAt: string;
    canonicalUrl: string;
    rawSourcePayload: Record<string, unknown>;
    description?: string | undefined;
    endsAt?: string | undefined;
    locationName?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    imageUrl?: string | undefined;
}>;
export type NormalizedHackathon = z.infer<typeof NormalizedHackathonSchema>;
//# sourceMappingURL=schema.d.ts.map