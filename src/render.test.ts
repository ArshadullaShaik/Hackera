import { describe, it, expect, vi } from "vitest";
import { checkScrapeRunsAndEnqueue } from "./render.js";
import { SCRAPER_JOBS } from "./queue/scrape.scheduler.js";

describe("checkScrapeRunsAndEnqueue", () => {
  it("enqueues all jobs when no scrape runs exist in database", async () => {
    const mockQueue = {
      add: vi.fn().mockResolvedValue({}),
    };
    const mockPrisma = {
      scrapeRun: {
        groupBy: vi.fn().mockResolvedValue([]),
      },
    };

    const didEnqueue = await checkScrapeRunsAndEnqueue(mockQueue as any, mockPrisma);

    expect(didEnqueue).toBe(true);
    expect(mockQueue.add).toHaveBeenCalledTimes(SCRAPER_JOBS.length);
  });

  it("skips enqueuing when all scrapers ran within the last 6 hours", async () => {
    const mockQueue = {
      add: vi.fn().mockResolvedValue({}),
    };
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const mockPrisma = {
      scrapeRun: {
        groupBy: vi.fn().mockResolvedValue(
          SCRAPER_JOBS.map((job) => ({
            platform: job.replace("scrape:", ""),
            _max: { startedAt: twoHoursAgo },
          }))
        ),
      },
    };

    const didEnqueue = await checkScrapeRunsAndEnqueue(mockQueue as any, mockPrisma);

    expect(didEnqueue).toBe(false);
    expect(mockQueue.add).not.toHaveBeenCalled();
  });

  it("enqueues all jobs when any scraper ran older than 6 hours ago", async () => {
    const mockQueue = {
      add: vi.fn().mockResolvedValue({}),
    };
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const sevenHoursAgo = new Date(Date.now() - 7 * 60 * 60 * 1000);
    const mockPrisma = {
      scrapeRun: {
        groupBy: vi.fn().mockResolvedValue(
          SCRAPER_JOBS.map((job, idx) => ({
            platform: job.replace("scrape:", ""),
            _max: { startedAt: idx === 0 ? sevenHoursAgo : twoHoursAgo },
          }))
        ),
      },
    };

    const didEnqueue = await checkScrapeRunsAndEnqueue(mockQueue as any, mockPrisma);

    expect(didEnqueue).toBe(true);
    expect(mockQueue.add).toHaveBeenCalledTimes(SCRAPER_JOBS.length);
  });

  it("enqueues all jobs when any scraper has never run", async () => {
    const mockQueue = {
      add: vi.fn().mockResolvedValue({}),
    };
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    // Exclude the first scraper from the runs list
    const remainingJobs = SCRAPER_JOBS.slice(1);
    const mockPrisma = {
      scrapeRun: {
        groupBy: vi.fn().mockResolvedValue(
          remainingJobs.map((job) => ({
            platform: job.replace("scrape:", ""),
            _max: { startedAt: twoHoursAgo },
          }))
        ),
      },
    };

    const didEnqueue = await checkScrapeRunsAndEnqueue(mockQueue as any, mockPrisma);

    expect(didEnqueue).toBe(true);
    expect(mockQueue.add).toHaveBeenCalledTimes(SCRAPER_JOBS.length);
  });
});
