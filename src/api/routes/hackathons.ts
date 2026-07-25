import { Router, Request, Response, NextFunction } from "express";
import { HackathonRepository } from "../../persistence/hackathon.repository.js";
import { HackathonQuerySchema, UuidParamSchema } from "../middleware/validate.js";
import { ApiError } from "../middleware/error-handler.js";
import { ZodError } from "zod";

export function createHackathonRouter(repository: HackathonRepository): Router {
  const router = Router();

  /**
   * GET /hackathons — paginated list with optional filters
   */
  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate query params
      const parseResult = HackathonQuerySchema.safeParse(req.query);
      if (!parseResult.success) {
        const messages = parseResult.error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join("; ");
        throw new ApiError(400, `Invalid query parameters: ${messages}`);
      }

      const { search, platform, locationType, startsAfter, startsBefore, includeDuplicates, page, limit } =
        parseResult.data;

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

      res.json({
        data,
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /hackathons/:id — single record by UUID
   */
  router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
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
    } catch (error) {
      next(error);
    }
  });

  return router;
}
