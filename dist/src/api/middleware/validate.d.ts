import { z } from "zod";
/**
 * Zod schema for GET /hackathons query parameters.
 * Coerces string query params to proper types.
 */
export declare const HackathonQuerySchema: z.ZodObject<{
    search: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
    platform: z.ZodEffects<z.ZodOptional<z.ZodEnum<["luma", "devfolio", "devpost", "mlh", "unstop", "hackerearth", "hackclub", "other"]>>, "luma" | "devfolio" | "devpost" | "mlh" | "unstop" | "hackerearth" | "hackclub" | "other" | undefined, unknown>;
    locationType: z.ZodEffects<z.ZodOptional<z.ZodEnum<["in-person", "online", "hybrid"]>>, "in-person" | "online" | "hybrid" | undefined, unknown>;
    startsAfter: z.ZodEffects<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>, string | undefined, unknown>;
    startsBefore: z.ZodEffects<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>, string | undefined, unknown>;
    includeDuplicates: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    locationType?: "in-person" | "online" | "hybrid" | undefined;
    search?: string | undefined;
    platform?: "luma" | "devfolio" | "devpost" | "mlh" | "unstop" | "hackerearth" | "hackclub" | "other" | undefined;
    startsAfter?: string | undefined;
    startsBefore?: string | undefined;
    includeDuplicates?: boolean | undefined;
}, {
    locationType?: unknown;
    page?: number | undefined;
    search?: unknown;
    platform?: unknown;
    limit?: number | undefined;
    startsAfter?: unknown;
    startsBefore?: unknown;
    includeDuplicates?: unknown;
}>;
export type HackathonQuery = z.infer<typeof HackathonQuerySchema>;
/**
 * Zod schema for UUID path parameter.
 */
export declare const UuidParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
//# sourceMappingURL=validate.d.ts.map