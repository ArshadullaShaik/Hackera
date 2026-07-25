import { z } from "zod";
/**
 * Zod schema for GET /hackathons query parameters.
 * Coerces string query params to proper types.
 */
export declare const HackathonQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    platform: z.ZodOptional<z.ZodEnum<["luma", "devfolio", "devpost", "other"]>>;
    locationType: z.ZodOptional<z.ZodEnum<["in-person", "online", "hybrid"]>>;
    startsAfter: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    startsBefore: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    includeDuplicates: z.ZodOptional<z.ZodEffects<z.ZodBoolean, boolean, unknown>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    locationType?: "in-person" | "online" | "hybrid" | undefined;
    platform?: "luma" | "devfolio" | "devpost" | "other" | undefined;
    search?: string | undefined;
    startsAfter?: string | undefined;
    startsBefore?: string | undefined;
    includeDuplicates?: boolean | undefined;
}, {
    locationType?: "in-person" | "online" | "hybrid" | undefined;
    page?: number | undefined;
    platform?: "luma" | "devfolio" | "devpost" | "other" | undefined;
    search?: string | undefined;
    startsAfter?: string | undefined;
    startsBefore?: string | undefined;
    includeDuplicates?: unknown;
    limit?: number | undefined;
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