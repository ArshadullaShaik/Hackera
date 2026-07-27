import { logger } from "../core/logger.js";
export class HackathonRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Upsert a hackathon: update if (sourceId, sourcePlatform) already exists, else create new.
     * Uses Prisma's native upsert — atomic, no race condition.
     */
    async upsert(hackathon) {
        try {
            // Check if record exists to determine created vs updated
            const existing = await this.prisma.hackathon.findUnique({
                where: {
                    sourceId_sourcePlatform: {
                        sourceId: hackathon.sourceId,
                        sourcePlatform: hackathon.sourcePlatform,
                    },
                },
                select: { id: true },
            });
            const data = {
                title: hackathon.title,
                description: hackathon.description,
                startsAt: new Date(hackathon.startsAt),
                endsAt: hackathon.endsAt ? new Date(hackathon.endsAt) : null,
                locationType: hackathon.locationType,
                locationName: hackathon.locationName,
                latitude: hackathon.latitude,
                longitude: hackathon.longitude,
                canonicalUrl: hackathon.canonicalUrl,
                imageUrl: hackathon.imageUrl,
                rawSourcePayload: hackathon.rawSourcePayload,
            };
            const result = await this.prisma.hackathon.upsert({
                where: {
                    sourceId_sourcePlatform: {
                        sourceId: hackathon.sourceId,
                        sourcePlatform: hackathon.sourcePlatform,
                    },
                },
                update: data,
                create: {
                    sourceId: hackathon.sourceId,
                    sourcePlatform: hackathon.sourcePlatform,
                    ...data,
                },
            });
            const created = !existing;
            logger.debug({ id: result.id, platform: hackathon.sourcePlatform, sourceId: hackathon.sourceId, created }, created ? "Hackathon record created" : "Hackathon record updated");
            return { id: result.id, created };
        }
        catch (error) {
            logger.error({
                error: error instanceof Error ? error.message : String(error),
                hackathon: { title: hackathon.title, sourceId: hackathon.sourceId },
            }, "Failed to upsert hackathon");
            throw error;
        }
    }
    /**
     * Batch upsert hackathons. Fail-soft: logs and skips individual failures.
     */
    async upsertBatch(hackathons) {
        let created = 0;
        let updated = 0;
        for (const hackathon of hackathons) {
            try {
                const result = await this.upsert(hackathon);
                if (result.created) {
                    created++;
                }
                else {
                    updated++;
                }
            }
            catch (error) {
                logger.warn({
                    error: error instanceof Error ? error.message : String(error),
                    title: hackathon.title,
                }, "Failed to upsert individual hackathon in batch");
                // Continue processing remaining hackathons
            }
        }
        return { created, updated };
    }
    /**
     * Query hackathons with combined optional filters + pagination.
     * Returns both data and total count for pagination metadata.
     */
    async findFiltered(filters) {
        const where = {};
        if (!filters.includeDuplicates) {
            where.duplicateOfId = null;
        }
        if (filters.search) {
            where.OR = [
                { title: { contains: filters.search, mode: "insensitive" } },
                { description: { contains: filters.search, mode: "insensitive" } },
            ];
        }
        if (filters.platform) {
            where.sourcePlatform = filters.platform;
        }
        if (filters.locationType) {
            where.locationType = filters.locationType;
        }
        if (filters.startsAfter || filters.startsBefore) {
            where.startsAt = {};
            if (filters.startsAfter) {
                where.startsAt.gte = filters.startsAfter;
            }
            if (filters.startsBefore) {
                where.startsAt.lte = filters.startsBefore;
            }
        }
        const offset = (filters.page - 1) * filters.limit;
        const [data, total] = await Promise.all([
            this.prisma.hackathon.findMany({
                where,
                take: filters.limit,
                skip: offset,
                orderBy: { startsAt: "asc" },
            }),
            this.prisma.hackathon.count({ where }),
        ]);
        return { data, total };
    }
    /**
     * Run cross-source deduplication on all records.
     * Identifies near-duplicate hackathons across platforms and links duplicate records.
     */
    async runCrossSourceDeduplication() {
        const { DedupService } = await import("../dedup/dedup.service.js");
        const dedupService = new DedupService();
        const allHackathons = await this.prisma.hackathon.findMany({
            select: {
                id: true,
                title: true,
                startsAt: true,
                sourcePlatform: true,
                description: true,
                locationName: true,
                imageUrl: true,
                duplicateOfId: true,
            },
            orderBy: { createdAt: "asc" },
        });
        let duplicatesFound = 0;
        for (let i = 0; i < allHackathons.length; i++) {
            const current = allHackathons[i];
            if (current.duplicateOfId)
                continue; // Already marked as duplicate
            const existingBefore = allHackathons.slice(0, i).filter((h) => !h.duplicateOfId);
            const match = dedupService.findDuplicate(current, existingBefore);
            if (match) {
                const canonicalId = match.duplicateOfId || match.id;
                await this.prisma.hackathon.update({
                    where: { id: current.id },
                    data: { duplicateOfId: canonicalId },
                });
                current.duplicateOfId = canonicalId;
                duplicatesFound++;
            }
        }
        logger.info({ duplicatesFound }, "Cross-source deduplication sweep complete");
        return duplicatesFound;
    }
    /**
     * Find a single hackathon by internal UUID.
     */
    async findById(id) {
        return this.prisma.hackathon.findUnique({
            where: { id },
        });
    }
    /**
     * Get all hackathons from database (paginated).
     */
    async findAll(limit = 100, offset = 0) {
        return this.prisma.hackathon.findMany({
            take: limit,
            skip: offset,
            orderBy: { startsAt: "asc" },
        });
    }
    /**
     * Get total count of hackathons.
     */
    async count() {
        return this.prisma.hackathon.count();
    }
    /**
     * Get hackathons by platform.
     */
    async findByPlatform(platform, limit = 100, offset = 0) {
        return this.prisma.hackathon.findMany({
            where: { sourcePlatform: platform },
            take: limit,
            skip: offset,
            orderBy: { startsAt: "asc" },
        });
    }
    /**
     * Get hackathons by date range.
     */
    async findByDateRange(startsAfter, startsBefore, limit = 100) {
        return this.prisma.hackathon.findMany({
            where: {
                startsAt: {
                    gte: startsAfter,
                    lte: startsBefore,
                },
            },
            take: limit,
            orderBy: { startsAt: "asc" },
        });
    }
    /**
     * Log a scrape run for job history tracking.
     */
    async logScrapeRun(run) {
        await this.prisma.scrapeRun.create({
            data: run,
        });
        logger.debug({ platform: run.platform, status: run.status }, "Scrape run logged");
    }
}
//# sourceMappingURL=hackathon.repository.js.map