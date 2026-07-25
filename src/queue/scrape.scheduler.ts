import { Queue } from "bullmq";
import { createRedisConnection } from "./connection.js";
import { logger } from "../core/logger.js";

const SCRAPER_JOBS = ["scrape:luma", "scrape:devfolio"];

// Retry config: exponential backoff — 30s, 60s, 120s
const JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: "exponential" as const,
    delay: 30_000,
  },
};

/**
 * Enqueue all scraper jobs once.
 */
async function enqueueAll(queue: Queue) {
  for (const jobName of SCRAPER_JOBS) {
    await queue.add(jobName, {}, { ...JOB_OPTIONS });
    logger.info({ jobName }, "Enqueued scrape job");
  }
}

/**
 * Start the scheduler.
 * --once flag: enqueue all jobs once and exit.
 * Default: set up repeatable jobs (every 6 hours).
 */
async function main() {
  const connection = createRedisConnection();
  const queue = new Queue("scrape", { connection });

  const isOnce = process.argv.includes("--once");

  if (isOnce) {
    logger.info("Running one-shot: enqueuing all scraper jobs");
    await enqueueAll(queue);
    await queue.close();
    connection.disconnect();
    logger.info("All jobs enqueued. Exiting.");
    return;
  }

  // Set up repeatable jobs — every 6 hours
  logger.info("Setting up repeatable scrape jobs (every 6 hours)");

  for (const jobName of SCRAPER_JOBS) {
    await queue.add(jobName, {}, {
      ...JOB_OPTIONS,
      repeat: {
        every: 6 * 60 * 60 * 1000, // 6 hours in ms
      },
    });
    logger.info({ jobName, interval: "6h" }, "Repeatable job registered");
  }

  logger.info("Scheduler running. Press Ctrl+C to stop.");

  // Keep process alive
  const shutdown = async () => {
    logger.info("Shutting down scheduler...");
    await queue.close();
    connection.disconnect();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  logger.error({ error: error instanceof Error ? error.message : String(error) }, "Scheduler failed");
  process.exit(1);
});
