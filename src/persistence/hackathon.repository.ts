import { Prisma, PrismaClient } from "@prisma/client";
import { NormalizedHackathon } from "../core/schema";
import { logger } from "../core/logger";
import { recreatePrismaClient } from "./db";
import { extractDetailDates } from "../core/detail-enrichment";

export class HackathonRepository {
  constructor(private prisma: PrismaClient) { }

  private mapRegistrationDates(row: any) {
    const detailDates = extractDetailDates(row.rawSourcePayload || {});
    return {
      ...row,
      registrationStartsAt: detailDates.registrationStartsAt,
      registrationEndsAt: detailDates.registrationEndsAt,
    };
  }

  private getBaseColumnsSql() {
    return Prisma.sql`
      id, "sourceId", "sourcePlatform", title, description, "startsAt", "endsAt",
      "locationType", "locationName", latitude, longitude, "canonicalUrl", "imageUrl",
      "rawSourcePayload", "createdAt", "updatedAt", "duplicateOfId"
    `;
  }

  private buildHackathonWhereSql(filters: {
    search?: string;
    platform?: string;
    locationType?: string;
    startsAfter?: Date;
    startsBefore?: Date;
    includeDuplicates?: boolean;
  }): Prisma.Sql {
    const conditions: Prisma.Sql[] = [];

    if (!filters.includeDuplicates) {
      conditions.push(Prisma.sql`"duplicateOfId" IS NULL`);
    }

    if (filters.search) {
      const search = `%${filters.search}%`;
      conditions.push(Prisma.sql`(
        title ILIKE ${search}
        OR description ILIKE ${search}
      )`);
    }

    if (filters.platform) {
      conditions.push(Prisma.sql`"sourcePlatform" = ${filters.platform}`);
    }

    if (filters.locationType) {
      conditions.push(Prisma.sql`"locationType" = ${filters.locationType}`);
    }

    if (filters.startsAfter) {
      conditions.push(Prisma.sql`"startsAt" >= ${filters.startsAfter}`);
    }

    if (filters.startsBefore) {
      conditions.push(Prisma.sql`"startsAt" <= ${filters.startsBefore}`);
    }

    const now = new Date();
    const graceDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    conditions.push(Prisma.sql`(
      "endsAt" >= ${now}
      OR ("endsAt" IS NULL AND "startsAt" >= ${graceDate})
    )`);

    if (conditions.length === 0) {
      return Prisma.sql``;
    }

    return Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`;
  }

  /**
   * Retry an operation once if the connection was dropped.
   * Recreates the Prisma client on the retry attempt.
   */
  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      const message = error?.message || String(error);
      const isConnError =
        message.includes("Server has closed the connection") ||
        message.includes("Connection terminated") ||
        message.includes("timeout") ||
        message.includes("closed") ||
        message.includes("TLS") ||
        message.includes("PrismaClient");

      if (isConnError) {
        logger.warn({ error: message }, "Database connection error caught — recreating client and retrying...");
        this.prisma = await recreatePrismaClient();
        return await operation();
      }
      throw error;
    }
  }

  /**
   * Upsert a hackathon: update if (sourceId, sourcePlatform) already exists, else create new.
   * Uses Prisma's native upsert — atomic, no race condition.
   */
  async upsert(hackathon: NormalizedHackathon): Promise<{ id: string; created: boolean }> {
    return this.withRetry(async () => {
      try {
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
          rawSourcePayload: hackathon.rawSourcePayload as Prisma.JsonObject,
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
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        const created = Math.abs(result.createdAt.getTime() - result.updatedAt.getTime()) < 1000;
        logger.debug(
          { id: result.id, platform: hackathon.sourcePlatform, sourceId: hackathon.sourceId, created },
          created ? "Hackathon record created" : "Hackathon record updated"
        );

        return { id: result.id, created };
      } catch (error) {
        logger.error(
          {
            error: error instanceof Error ? error.message : String(error),
            hackathon: { title: hackathon.title, sourceId: hackathon.sourceId },
          },
          "Failed to upsert hackathon"
        );
        throw error;
      }
    });
  }

  /**
   * Batch upsert hackathons. Fail-soft: logs and skips individual failures.
   */
  async upsertBatch(hackathons: NormalizedHackathon[]): Promise<{
    created: number;
    updated: number;
  }> {
    let created = 0;
    let updated = 0;

    for (const hackathon of hackathons) {
      try {
        const result = await this.upsert(hackathon);
        if (result.created) {
          created++;
        } else {
          updated++;
        }
      } catch (error) {
        logger.warn(
          {
            error: error instanceof Error ? error.message : String(error),
            title: hackathon.title,
          },
          "Failed to upsert individual hackathon in batch"
        );
        // Continue processing remaining hackathons
      }
    }

    return { created, updated };
  }

  /** Remove source records that are no longer present in a successful full scrape. */
  async deleteMissingFromSource(sourcePlatform: string, sourceIds: string[]): Promise<number> {
    if (sourceIds.length === 0) return 0;

    return this.withRetry(async () => {
      const result = await this.prisma.hackathon.deleteMany({
        where: {
          sourcePlatform,
          sourceId: { notIn: sourceIds },
        },
      });
      logger.info({ sourcePlatform, deletedCount: result.count }, "Removed stale source hackathons");
      return result.count;
    });
  }

  /**
   * Automatically check whole database and delete hackathons that have ended.
   * A hackathon is considered ended if:
   * 1. endsAt is provided and endsAt < now
   * 2. endsAt is null and startsAt < now
   */
  async deleteEndedHackathons(now: Date = new Date()): Promise<number> {
    const graceDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return this.withRetry(async () => {
      const result = await this.prisma.hackathon.deleteMany({
        where: {
          OR: [
            { endsAt: { lt: now } },
            { endsAt: null, startsAt: { lt: graceDate } },
          ],
        },
      });
      logger.info({ deletedCount: result.count }, "Auto-cleaned ended hackathons from database");
      return result.count;
    });
  }

  /**
   * Query hackathons with combined optional filters + pagination.
   * Excludes ended hackathons and orders soonest first (startsAt asc).
   * Returns both data and total count for pagination metadata.
   */
  async findFiltered(filters: {
    search?: string;
    platform?: string;
    locationType?: string;
    startsAfter?: Date;
    startsBefore?: Date;
    includeDuplicates?: boolean;
    page: number;
    limit: number;
  }): Promise<{ data: any[]; total: number }> {
    return this.withRetry(async () => {
      const offset = (filters.page - 1) * filters.limit;
      const whereSql = this.buildHackathonWhereSql(filters);

      const allData = await this.prisma.$queryRaw<any[]>(Prisma.sql`
        SELECT ${this.getBaseColumnsSql()}
        FROM "Hackathon"
        ${whereSql}
        ORDER BY "startsAt" ASC
      `);

      const now = new Date();
      const prizeValue = (hackathon: any) => {
        const raw = hackathon.rawSourcePayload || {};
        const text = [raw.prize_amount, raw.prize_money, raw.prizes, hackathon.description]
          .filter(Boolean)
          .join(" ")
          .replace(/<[^>]*>/g, " ");
        const match = text.match(/(?:\$|₹|€|£|USD|INR|Rs\.?)[\s]*([\d,.]+)\s*(k|m|million|thousand|lakh|crore)?/i);
        if (!match) return 0;

        const amount = Number(match[1].replace(/,/g, ""));
        const multiplier = {
          k: 1_000,
          thousand: 1_000,
          m: 1_000_000,
          million: 1_000_000,
          lakh: 100_000,
          crore: 10_000_000,
        }[match[2]?.toLowerCase() || ""] || 1;
        return Number.isFinite(amount) ? amount * multiplier : 0;
      };
      const isCurrent = (hackathon: any) => new Date(hackathon.startsAt) <= now;

      allData.sort((a: any, b: any) => {
        const currentOrder = Number(isCurrent(b)) - Number(isCurrent(a));
        if (currentOrder) return currentOrder;
        if (isCurrent(a)) {
          const prizeOrder = prizeValue(b) - prizeValue(a);
          if (prizeOrder) return prizeOrder;
        }
        return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
      });

      return {
        data: allData.slice(offset, offset + filters.limit).map((row: any) => this.mapRegistrationDates(row)),
        total: allData.length,
      };
    });
  }

  /**
   * Run cross-source deduplication on all records.
   * Identifies near-duplicate hackathons across platforms and links duplicate records.
   */
  async runCrossSourceDeduplication(): Promise<number> {
    const { DedupService } = await import("../dedup/dedup.service");
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
      if (current.duplicateOfId) continue; // Already marked as duplicate

      const existingBefore = allHackathons.slice(0, i).filter((h: any) => !h.duplicateOfId);
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
  async findById(id: string) {
    return this.withRetry(async () => {
      const rows = await this.prisma.$queryRaw<any[]>(Prisma.sql`
        SELECT ${this.getBaseColumnsSql()}
        FROM "Hackathon"
        WHERE id = ${id}
        LIMIT 1
      `);

      return rows[0] ? this.mapRegistrationDates(rows[0]) : null;
    });
  }

  /**
   * Get all hackathons from database (paginated, latest first).
   */
  async findAll(limit: number = 100, offset: number = 0) {
    return this.withRetry(async () => {
      const rows = await this.prisma.$queryRaw<any[]>(Prisma.sql`
        SELECT ${this.getBaseColumnsSql()}
        FROM "Hackathon"
        ORDER BY "startsAt" DESC
        LIMIT ${limit} OFFSET ${offset}
      `);

      return rows.map((row: any) => this.mapRegistrationDates(row));
    });
  }

  /**
   * Get total count of hackathons.
   */
  async count(): Promise<number> {
    return this.withRetry(async () => {
      const rows = await this.prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
        SELECT COUNT(*)::bigint AS count FROM "Hackathon"
      `);

      return Number(rows[0]?.count || 0n);
    });
  }

  /**
   * Get hackathons by platform (latest first).
   */
  async findByPlatform(platform: string, limit: number = 100, offset: number = 0) {
    return this.withRetry(async () => {
      const rows = await this.prisma.$queryRaw<any[]>(Prisma.sql`
        SELECT ${this.getBaseColumnsSql()}
        FROM "Hackathon"
        WHERE "sourcePlatform" = ${platform}
        ORDER BY "startsAt" DESC
        LIMIT ${limit} OFFSET ${offset}
      `);

      return rows.map((row: any) => this.mapRegistrationDates(row));
    });
  }

  /**
   * Get hackathons by date range (latest first).
   */
  async findByDateRange(startsAfter: Date, startsBefore: Date, limit: number = 100) {
    return this.withRetry(async () => {
      const rows = await this.prisma.$queryRaw<any[]>(Prisma.sql`
        SELECT ${this.getBaseColumnsSql()}
        FROM "Hackathon"
        WHERE "startsAt" >= ${startsAfter} AND "startsAt" <= ${startsBefore}
        ORDER BY "startsAt" DESC
        LIMIT ${limit}
      `);

      return rows.map((row: any) => this.mapRegistrationDates(row));
    });
  }

  /**
   * Log a scrape run for job history tracking.
   */
  async logScrapeRun(run: {
    platform: string;
    status: string;
    eventsCreated: number;
    eventsUpdated: number;
    errorMessage?: string;
    startedAt: Date;
    completedAt: Date;
  }): Promise<void> {
    await this.prisma.scrapeRun.create({
      data: run,
    });
    logger.debug(
      { platform: run.platform, status: run.status },
      "Scrape run logged"
    );
  }
}
