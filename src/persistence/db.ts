import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { logger } from "../core/logger.js";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

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
