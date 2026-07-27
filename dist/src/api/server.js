import dotenv from "dotenv";
dotenv.config();
import express from "express";
import rateLimit from "express-rate-limit";
import { createHackathonRouter } from "./routes/hackathons.js";
import { errorHandler } from "./middleware/error-handler.js";
import { HackathonRepository } from "../persistence/hackathon.repository.js";
import { getPrismaClient, disconnectPrisma } from "../persistence/db.js";
import { logger } from "../core/logger.js";
/**
 * Create and configure the Express app.
 * Exported for testability.
 */
export function createApp(repository) {
    const app = express();
    // JSON body parsing
    app.use(express.json());
    // Rate limiting — 100 requests per 15 minutes per IP
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            error: {
                status: 429,
                message: "Too many requests, please try again later",
            },
        },
    });
    app.use(limiter);
    // Routes
    app.use("/hackathons", createHackathonRouter(repository));
    // Health check
    app.get("/health", (_req, res) => {
        res.json({ status: "ok" });
    });
    // Error handling (must be last)
    app.use(errorHandler);
    return app;
}
/**
 * Start the API server.
 */
async function main() {
    const port = parseInt(process.env.PORT || "3000", 10);
    const prisma = getPrismaClient();
    const repository = new HackathonRepository(prisma);
    const app = createApp(repository);
    const server = app.listen(port, () => {
        logger.info({ port }, "Hackera API server started");
    });
    // Graceful shutdown
    const shutdown = async () => {
        logger.info("Shutting down API server...");
        server.close();
        await disconnectPrisma();
        process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}
main().catch((error) => {
    logger.error({ error: error instanceof Error ? error.message : String(error) }, "Failed to start API server");
    process.exit(1);
});
//# sourceMappingURL=server.js.map