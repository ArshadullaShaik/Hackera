import dotenv from "dotenv";
dotenv.config();

import { Queue } from "bullmq";
import { startServer } from "./api/server.js";
import { startWorker } from "./queue/scrape.worker.js";
import { registerRepeatableJobs, enqueueAll, SCRAPER_JOBS } from "./queue/scrape.scheduler.js";
import { createRedisConnection } from "./queue/connection.js";
import { getPrismaClient, disconnectPrisma } from "./persistence/db.js";
import { logger } from "./core/logger.js";
import { isMainModule } from "./core/is-main.js";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

/**
 * Check ScrapeRun table on boot. If the most recent run for any scraper is older
 * than 6 hours (or there are none), enqueue all scraper jobs immediately.
 */
export async function checkScrapeRunsAndEnqueue(
  queue: Pick<Queue, "add">,
  prisma: any = getPrismaClient()
): Promise<boolean> {
  const platforms = SCRAPER_JOBS.map((job) => job.replace("scrape:", ""));

  try {
    const runs: Array<{ platform: string; _max: { startedAt: Date | null } }> =
      await prisma.scrapeRun.groupBy({
        by: ["platform"],
        _max: {
          startedAt: true,
        },
      });

    const now = Date.now();
    let shouldScrape = runs.length === 0;
    let triggerReason = runs.length === 0 ? "No previous scrape runs found in database" : "";

    if (!shouldScrape) {
      for (const platform of platforms) {
        const platformRun = runs.find((r) => r.platform === platform);
        if (!platformRun || !platformRun._max.startedAt) {
          shouldScrape = true;
          triggerReason = `No previous scrape run found for "${platform}"`;
          break;
        }

        const ageMs = now - new Date(platformRun._max.startedAt).getTime();
        if (ageMs > SIX_HOURS_MS) {
          shouldScrape = true;
          const ageHours = (ageMs / (60 * 60 * 1000)).toFixed(1);
          triggerReason = `Most recent run for "${platform}" is ${ageHours}h old (> 6h)`;
          break;
        }
      }
    }

    if (shouldScrape) {
      logger.info({ reason: triggerReason }, "Boot check: triggering immediate scrape run");
      await enqueueAll(queue as Queue);
      return true;
    } else {
      logger.info(
        "Boot check: all scrapers ran within the last 6 hours. Skipping immediate scrape."
      );
      return false;
    }
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Boot check: failed to query ScrapeRun table"
    );
    return false;
  }
}

async function main() {
  logger.info("Starting Hackera unified service for Render...");

  // 1. Start Express API server (reads process.env.PORT and binds to 0.0.0.0)
  const server = startServer();

  // 2. Start BullMQ worker for the "scrape" queue
  const workerConnection = createRedisConnection();
  const worker = startWorker(workerConnection);

  // 3. Register repeatable jobs on boot (every 6 hours)
  const queueConnection = createRedisConnection();
  const queue = new Queue("scrape", { connection: queueConnection });

  await registerRepeatableJobs(queue);

  // 4. On boot, check ScrapeRun table: if most recent run for any scraper is > 6h (or none), scrape immediately
  await checkScrapeRunsAndEnqueue(queue);

  // 5. Re-run repeatable job registration every 30 minutes
  // Safe because BullMQ dedupes identical repeat definitions.
  // Recovers schedules if Redis was restarted while the app stayed up.
  // NOTE: ScrapeRun boot check is NOT done here, only once at boot.
  const RE_REGISTER_INTERVAL_MS = 30 * 60 * 1000;
  const intervalId = setInterval(async () => {
    try {
      logger.info("Re-registering repeatable jobs (30m periodic refresh)...");
      await registerRepeatableJobs(queue);
    } catch (error) {
      logger.error(
        { error: error instanceof Error ? error.message : String(error) },
        "Failed to re-register repeatable jobs"
      );
    }
  }, RE_REGISTER_INTERVAL_MS);

  // 6. Graceful shutdown handler for SIGINT and SIGTERM
  let isShuttingDown = false;
  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.info({ signal }, "Shutting down Render unified service...");

    clearInterval(intervalId);

    // Stop accepting new HTTP requests
    await new Promise<void>((resolve) => {
      server.close((err) => {
        if (err) {
          logger.error({ error: err.message }, "Error closing HTTP server");
        } else {
          logger.info("HTTP server closed");
        }
        resolve();
      });
    });

    // Close BullMQ worker (finishes in-flight jobs)
    try {
      logger.info("Closing BullMQ worker...");
      await worker.close();
      logger.info("BullMQ worker closed");
    } catch (err) {
      logger.error(
        { error: err instanceof Error ? err.message : String(err) },
        "Error closing BullMQ worker"
      );
    }

    // Close BullMQ queue
    try {
      logger.info("Closing BullMQ queue...");
      await queue.close();
      logger.info("BullMQ queue closed");
    } catch (err) {
      logger.error(
        { error: err instanceof Error ? err.message : String(err) },
        "Error closing BullMQ queue"
      );
    }

    // Disconnect Redis connections
    try {
      logger.info("Disconnecting Redis connections...");
      workerConnection.disconnect();
      queueConnection.disconnect();
      logger.info("Redis connections disconnected");
    } catch (err) {
      logger.error(
        { error: err instanceof Error ? err.message : String(err) },
        "Error disconnecting Redis connections"
      );
    }

    // Disconnect Prisma
    try {
      await disconnectPrisma();
    } catch (err) {
      logger.error(
        { error: err instanceof Error ? err.message : String(err) },
        "Error disconnecting Prisma"
      );
    }

    logger.info("Render unified service shut down successfully");
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Failed to start Render unified service"
    );
    process.exit(1);
  });
}
