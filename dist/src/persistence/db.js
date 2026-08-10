import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { logger } from "../core/logger.js";
const globalForPrisma = globalThis;
function createPool() {
    const p = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 30000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 5000,
    });
    // Log and evict dead connections instead of crashing
    p.on("error", (err) => {
        logger.warn({ error: err.message }, "Pool background connection error (evicted)");
    });
    return p;
}
export function getPrismaClient() {
    if (!globalForPrisma.prisma) {
        globalForPrisma.pool = createPool();
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
export async function recreatePrismaClient() {
    logger.info("Recreating Prisma client after connection loss...");
    await disconnectPrisma();
    return getPrismaClient();
}
export async function disconnectPrisma() {
    if (globalForPrisma.prisma) {
        try {
            await globalForPrisma.prisma.$disconnect();
        }
        catch (_) { }
        globalForPrisma.prisma = undefined;
    }
    if (globalForPrisma.pool) {
        try {
            await globalForPrisma.pool.end();
        }
        catch (_) { }
        globalForPrisma.pool = undefined;
    }
    logger.info("Prisma client disconnected and pool drained");
}
//# sourceMappingURL=db.js.map