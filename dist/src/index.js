import dotenv from "dotenv";
dotenv.config();
import { LumaScraper } from "./scrapers/luma/luma.scraper.js";
import { DevfolioScraper } from "./scrapers/devfolio/devfolio.scraper.js";
import { MLHScraper } from "./scrapers/mlh/mlh.scraper.js";
import { UnstopScraper } from "./scrapers/unstop/unstop.scraper.js";
import { DevpostScraper } from "./scrapers/devpost/devpost.scraper.js";
import { HackerEarthScraper } from "./scrapers/hackerearth/hackerearth.scraper.js";
import { HackClubScraper } from "./scrapers/hackclub/hackclub.scraper.js";
import { HackathonRepository } from "./persistence/hackathon.repository.js";
import { getPrismaClient, disconnectPrisma } from "./persistence/db.js";
import { logger } from "./core/logger.js";
async function main() {
    logger.info("Starting hackathon aggregator - All Platforms Multi-Scrape");
    const scrapers = [
        { name: "Luma", scraper: new LumaScraper() },
        { name: "Devfolio", scraper: new DevfolioScraper() },
        { name: "MLH", scraper: new MLHScraper() },
        { name: "Unstop", scraper: new UnstopScraper() },
        { name: "Devpost", scraper: new DevpostScraper() },
        { name: "HackerEarth", scraper: new HackerEarthScraper() },
        { name: "HackClub", scraper: new HackClubScraper() },
    ];
    const prisma = getPrismaClient();
    const repository = new HackathonRepository(prisma);
    const allHackathons = [];
    try {
        // Run all scrapers sequentially
        for (const { name, scraper } of scrapers) {
            try {
                logger.info(`Scraping ${name}...`);
                const hackathons = await scraper.scrape();
                logger.info({ platform: name, count: hackathons.length }, `${name} scraping complete`);
                allHackathons.push({
                    platform: name,
                    events: hackathons,
                });
            }
            catch (error) {
                logger.error({
                    platform: name,
                    error: error instanceof Error ? error.message : String(error),
                }, `${name} scraper failed`);
                // Continue with next scraper even if one fails
            }
        }
        // Persist all events to database
        console.log("\n" + "=".repeat(80));
        console.log("PHASE 3 VALIDATION: Persisting to PostgreSQL");
        console.log("=".repeat(80) + "\n");
        let totalCreated = 0;
        let totalUpdated = 0;
        const now = new Date();
        for (const { platform, events } of allHackathons) {
            if (events.length === 0)
                continue;
            const activeEvents = events.filter((h) => {
                if (h.endsAt && new Date(h.endsAt) < now)
                    return false;
                if (!h.endsAt && new Date(h.startsAt) < now)
                    return false;
                return true;
            });
            logger.info({ platform, count: activeEvents.length }, `Persisting ${activeEvents.length} active events from ${platform}`);
            const result = await repository.upsertBatch(activeEvents);
            totalCreated += result.created;
            totalUpdated += result.updated;
            console.log(`[${platform}] Created: ${result.created}, Updated: ${result.updated}`);
        }
        const duplicatesFound = await repository.runCrossSourceDeduplication();
        console.log(`Cross-Source Duplicates Linked: ${duplicatesFound}`);
        const deletedCount = await repository.deleteEndedHackathons(now);
        console.log(`Ended Hackathons Auto-Cleaned: ${deletedCount}`);
        console.log("\n" + "-".repeat(80));
        console.log(`Total Created: ${totalCreated}`);
        console.log(`Total Updated: ${totalUpdated}`);
        console.log(`Total in DB: ${await repository.count()}`);
        console.log("-".repeat(80) + "\n");
        // Show sample from database
        console.log("Sample from database (first 3 hackathons):");
        const samples = await repository.findAll(3);
        for (let i = 0; i < samples.length; i++) {
            const h = samples[i];
            console.log(`[${i + 1}] ${h.title}`);
            console.log(`    Platform: ${h.sourcePlatform} | ID: ${h.sourceId}`);
            console.log(`    Starts: ${h.startsAt}`);
            console.log(`    URL: ${h.canonicalUrl}`);
        }
        if (samples.length === 0) {
            console.log("(No hackathons in database)");
        }
        console.log("\n" + "=".repeat(80));
        console.log("Phase 3 Acceptance Criteria Check:");
        console.log(`✓ PostgreSQL persistence working: ${totalCreated + totalUpdated > 0 ? "YES" : "NO"}`);
        console.log(`✓ Upsert logic (no duplicates on second run): ${totalUpdated > 0 ? "YES (had updates)" : "UNKNOWN (run twice to verify)"}`);
        console.log("=".repeat(80) + "\n");
    }
    catch (error) {
        logger.error({ error: error instanceof Error ? error.message : String(error) }, "Fatal error in main");
        process.exit(1);
    }
    finally {
        await disconnectPrisma();
    }
}
main();
//# sourceMappingURL=index.js.map