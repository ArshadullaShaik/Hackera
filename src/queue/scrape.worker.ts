import { Worker, Job } from "bullmq";
import { createRedisConnection } from "./connection.js";
import { LumaScraper } from "../scrapers/luma/luma.scraper.js";
import { DevfolioScraper } from "../scrapers/devfolio/devfolio.scraper.js";
import { MLHScraper } from "../scrapers/mlh/mlh.scraper.js";
import { UnstopScraper } from "../scrapers/unstop/unstop.scraper.js";
import { DevpostScraper } from "../scrapers/devpost/devpost.scraper.js";
import { HackerEarthScraper } from "../scrapers/hackerearth/hackerearth.scraper.js";
import { HackClubScraper } from "../scrapers/hackclub/hackclub.scraper.js";
import { HackathonRepository } from "../persistence/hackathon.repository.js";
import { getPrismaClient, disconnectPrisma } from "../persistence/db.js";
import { Scraper } from "../core/scraper.interface.js";
import { logger } from "../core/logger.js";

const SCRAPER_MAP: Record<string, () => Scraper> = {
  "scrape:luma": () => new LumaScraper(),
  "scrape:devfolio": () => new DevfolioScraper(),
  "scrape:mlh": () => new MLHScraper(),
  "scrape:unstop": () => new UnstopScraper(),
  "scrape:devpost": () => new DevpostScraper(),
  "scrape:hackerearth": () => new HackerEarthScraper(),
  "scrape:hackclub": () => new HackClubScraper(),
};

async function processJob(job: Job): Promise<{ created: number; updated: number }> {
  const scraperFactory = SCRAPER_MAP[job.name];
  if (!scraperFactory) {
    throw new Error(`Unknown scraper job: ${job.name}`);
  }

  const platform = job.name.replace("scrape:", "");
  logger.info({ jobId: job.id, platform }, "Starting scrape job");

  const prisma = getPrismaClient();
  const repository = new HackathonRepository(prisma);
  const scraper = scraperFactory();

  const startedAt = new Date();
  try {
    const hackathons = await scraper.scrape();

    // Filter out ended hackathons before persisting
    const now = new Date();
    const activeHackathons = hackathons.filter((h) => {
      if (h.endsAt && new Date(h.endsAt) < now) return false;
      if (!h.endsAt && new Date(h.startsAt) < now) return false;
      return true;
    });

    const result = await repository.upsertBatch(activeHackathons);

    // Run cross-source deduplication pass
    await repository.runCrossSourceDeduplication();

    // Auto-clean any ended hackathons from database
    await repository.deleteEndedHackathons(now);

    // Log the scrape run
    await repository.logScrapeRun({
      platform,
      status: "completed",
      eventsCreated: result.created,
      eventsUpdated: result.updated,
      startedAt,
      completedAt: new Date(),
    });

    logger.info(
      { jobId: job.id, platform, created: result.created, updated: result.updated },
      "Scrape job completed"
    );

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Log the failed scrape run
    await repository.logScrapeRun({
      platform,
      status: "failed",
      eventsCreated: 0,
      eventsUpdated: 0,
      errorMessage,
      startedAt,
      completedAt: new Date(),
    });

    logger.error({ jobId: job.id, platform, error: errorMessage }, "Scrape job failed");
    throw error;
  }
}

/**
 * Start the BullMQ worker.
 */
async function main() {
  const connection = createRedisConnection();

  const worker = new Worker("scrape", processJob, {
    connection,
    concurrency: 1, // One scraper at a time to be polite to source APIs
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 50 },
  });

  worker.on("ready", () => {
    logger.info("Scrape worker ready and listening for jobs");
  });

  worker.on("failed", (job, err) => {
    logger.error(
      { jobId: job?.id, name: job?.name, error: err.message, attempt: job?.attemptsMade },
      "Job failed"
    );
  });

  worker.on("completed", (job, result) => {
    logger.info(
      { jobId: job.id, name: job.name, result },
      "Job completed"
    );
  });

  // Graceful shutdown
  const shutdown = async () => {
    logger.info("Shutting down worker...");
    await worker.close();
    await disconnectPrisma();
    connection.disconnect();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  logger.error({ error: error instanceof Error ? error.message : String(error) }, "Worker failed to start");
  process.exit(1);
});
