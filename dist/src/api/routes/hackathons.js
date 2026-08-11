import { Router } from "express";
import { HackathonQuerySchema, UuidParamSchema } from "../middleware/validate.js";
import { ApiError } from "../middleware/error-handler.js";
import { apiQueryCache } from "../../core/cache.js";
export function createHackathonRouter(repository) {
    const router = Router();
    /**
     * GET /hackathons — paginated list with optional filters
     */
    router.get("/", async (req, res, next) => {
        try {
            // Validate query params
            const parseResult = HackathonQuerySchema.safeParse(req.query);
            if (!parseResult.success) {
                const messages = parseResult.error.errors
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join("; ");
                throw new ApiError(400, `Invalid query parameters: ${messages}`);
            }
            const cacheKey = JSON.stringify(parseResult.data);
            const cachedResponse = apiQueryCache.get(cacheKey);
            if (cachedResponse) {
                res.setHeader("X-Cache", "HIT");
                res.setHeader("Cache-Control", "public, max-age=60");
                res.json(cachedResponse);
                return;
            }
            const { search, platform, locationType, startsAfter, startsBefore, includeDuplicates, page, limit } = parseResult.data;
            const { data, total } = await repository.findFiltered({
                search,
                platform,
                locationType,
                startsAfter: startsAfter ? new Date(startsAfter) : undefined,
                startsBefore: startsBefore ? new Date(startsBefore) : undefined,
                includeDuplicates,
                page,
                limit,
            });
            const totalPages = Math.ceil(total / limit);
            const payload = {
                data,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages,
                },
            };
            apiQueryCache.set(cacheKey, payload);
            res.setHeader("X-Cache", "MISS");
            res.setHeader("Cache-Control", "public, max-age=60");
            res.json(payload);
        }
        catch (error) {
            next(error);
        }
    });
    /**
     * GET /hackathons/:id — single record by UUID
     */
    router.get("/:id", async (req, res, next) => {
        try {
            // Validate UUID param
            const parseResult = UuidParamSchema.safeParse(req.params);
            if (!parseResult.success) {
                throw new ApiError(400, "Invalid hackathon ID: must be a valid UUID");
            }
            const hackathon = await repository.findById(parseResult.data.id);
            if (!hackathon) {
                throw new ApiError(404, `Hackathon not found: ${parseResult.data.id}`);
            }
            res.json({ data: hackathon });
        }
        catch (error) {
            next(error);
        }
    });
    return router;
}
//# sourceMappingURL=hackathons.js.map