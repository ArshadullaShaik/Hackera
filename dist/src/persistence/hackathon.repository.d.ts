import { Prisma, PrismaClient } from "@prisma/client";
import { NormalizedHackathon } from "../core/schema";
export declare class HackathonRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Upsert a hackathon: update if (sourceId, sourcePlatform) already exists, else create new.
     * Uses Prisma's native upsert — atomic, no race condition.
     */
    upsert(hackathon: NormalizedHackathon): Promise<{
        id: string;
        created: boolean;
    }>;
    /**
     * Batch upsert hackathons. Fail-soft: logs and skips individual failures.
     */
    upsertBatch(hackathons: NormalizedHackathon[]): Promise<{
        created: number;
        updated: number;
    }>;
    /** Remove source records that are no longer present in a successful full scrape. */
    deleteMissingFromSource(sourcePlatform: string, sourceIds: string[]): Promise<number>;
    /**
     * Automatically check whole database and delete hackathons that have ended.
     * A hackathon is considered ended if:
     * 1. endsAt is provided and endsAt < now
     * 2. endsAt is null and startsAt < now
     */
    deleteEndedHackathons(now?: Date): Promise<number>;
    /**
     * Query hackathons with combined optional filters + pagination.
     * Excludes ended hackathons and orders soonest first (startsAt asc).
     * Returns both data and total count for pagination metadata.
     */
    findFiltered(filters: {
        search?: string;
        platform?: string;
        locationType?: string;
        startsAfter?: Date;
        startsBefore?: Date;
        includeDuplicates?: boolean;
        page: number;
        limit: number;
    }): Promise<{
        data: any[];
        total: number;
    }>;
    /**
     * Run cross-source deduplication on all records.
     * Identifies near-duplicate hackathons across platforms and links duplicate records.
     */
    runCrossSourceDeduplication(): Promise<number>;
    /**
     * Find a single hackathon by internal UUID.
     */
    findById(id: string): Promise<{
        id: string;
        sourceId: string;
        sourcePlatform: string;
        title: string;
        description: string;
        startsAt: Date;
        endsAt: Date | null;
        locationType: string;
        locationName: string | null;
        latitude: number | null;
        longitude: number | null;
        canonicalUrl: string;
        imageUrl: string | null;
        rawSourcePayload: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
        duplicateOfId: string | null;
    } | null>;
    /**
     * Get all hackathons from database (paginated, latest first).
     */
    findAll(limit?: number, offset?: number): Promise<{
        id: string;
        sourceId: string;
        sourcePlatform: string;
        title: string;
        description: string;
        startsAt: Date;
        endsAt: Date | null;
        locationType: string;
        locationName: string | null;
        latitude: number | null;
        longitude: number | null;
        canonicalUrl: string;
        imageUrl: string | null;
        rawSourcePayload: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
        duplicateOfId: string | null;
    }[]>;
    /**
     * Get total count of hackathons.
     */
    count(): Promise<number>;
    /**
     * Get hackathons by platform (latest first).
     */
    findByPlatform(platform: string, limit?: number, offset?: number): Promise<{
        id: string;
        sourceId: string;
        sourcePlatform: string;
        title: string;
        description: string;
        startsAt: Date;
        endsAt: Date | null;
        locationType: string;
        locationName: string | null;
        latitude: number | null;
        longitude: number | null;
        canonicalUrl: string;
        imageUrl: string | null;
        rawSourcePayload: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
        duplicateOfId: string | null;
    }[]>;
    /**
     * Get hackathons by date range (latest first).
     */
    findByDateRange(startsAfter: Date, startsBefore: Date, limit?: number): Promise<{
        id: string;
        sourceId: string;
        sourcePlatform: string;
        title: string;
        description: string;
        startsAt: Date;
        endsAt: Date | null;
        locationType: string;
        locationName: string | null;
        latitude: number | null;
        longitude: number | null;
        canonicalUrl: string;
        imageUrl: string | null;
        rawSourcePayload: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
        duplicateOfId: string | null;
    }[]>;
    /**
     * Log a scrape run for job history tracking.
     */
    logScrapeRun(run: {
        platform: string;
        status: string;
        eventsCreated: number;
        eventsUpdated: number;
        errorMessage?: string;
        startedAt: Date;
        completedAt: Date;
    }): Promise<void>;
}
//# sourceMappingURL=hackathon.repository.d.ts.map