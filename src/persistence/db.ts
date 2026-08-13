import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { logger } from "../core/logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
};

function getOrCreatePool(): pg.Pool {
  if (!globalForPrisma.pool) {
    const connectionString =
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/postgres";

    globalForPrisma.pool = new pg.Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 5_000,
      connectionTimeoutMillis: 5_000,
    });

    globalForPrisma.pool.on("error", (err) => {
      logger.warn({ error: err.message }, "Postgres pool connection error");
    });
  }
  return globalForPrisma.pool;
}

export function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.pool = getOrCreatePool();
    const adapter = new PrismaPg(globalForPrisma.pool);

    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: [
        { level: "error", emit: "stdout" },
        { level: "warn", emit: "stdout" },
      ],
    });

    logger.info("Prisma client initialized");
  }

  return globalForPrisma.prisma;
}

/**
 * Force-recreate the Prisma client (e.g. after a connection loss).
 * Drains the old pool first.
 */
export async function recreatePrismaClient(): Promise<PrismaClient> {
  logger.info("Recreating Prisma client after connection loss...");
  await disconnectPrisma();
  return getPrismaClient();
}

export async function disconnectPrisma(): Promise<void> {
  if (globalForPrisma.prisma) {
    try {
      await globalForPrisma.prisma.$disconnect();
    } catch (_) { }
    globalForPrisma.prisma = undefined;
  }
  logger.info("Prisma client disconnected");
}
