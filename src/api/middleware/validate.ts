import { z } from "zod";

/**
 * Zod schema for GET /hackathons query parameters.
 * Coerces string query params to proper types.
 */
export const HackathonQuerySchema = z.object({
  search: z.string().optional(),
  platform: z.enum(["luma", "devfolio", "devpost", "other"]).optional(),
  locationType: z.enum(["in-person", "online", "hybrid"]).optional(),
  startsAfter: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), { message: "startsAfter must be a valid date (ISO 8601)" })
    .optional(),
  startsBefore: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), { message: "startsBefore must be a valid date (ISO 8601)" })
    .optional(),
  includeDuplicates: z
    .preprocess((val) => val === "true" || val === "1", z.boolean())
    .optional(),
  page: z.coerce
    .number()
    .int()
    .min(1, "page must be >= 1")
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "limit must be >= 1")
    .max(100, "limit must be <= 100")
    .default(20),
});

export type HackathonQuery = z.infer<typeof HackathonQuerySchema>;

/**
 * Zod schema for UUID path parameter.
 */
export const UuidParamSchema = z.object({
  id: z.string().uuid("id must be a valid UUID"),
});
