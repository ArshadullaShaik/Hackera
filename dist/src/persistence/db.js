import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { logger } from "../core/logger.js";
let prisma;
let pool = null;
function createPool() {
    const p = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 5,
        idleTimeoutMillis: 0, // Never kill idle clients — let the server decide
        connectionTimeoutMillis: 10000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000, // Send TCP keepalive every 10s to prevent Supabase pooler timeout
    });
    // Log and evict dead connections instead of crashing
    p.on("error", (err) => {
        logger.warn({ error: err.message }, "Pool background connection error (evicted)");
    });
    return p;
}
export function getPrismaClient() {
    if (!prisma) {
        pool = createPool();
        const adapter = new PrismaPg(pool);
        prisma = new PrismaClient({
            adapter,
            log: [
                { level: "error", emit: "stdout" },
                { level: "warn", emit: "stdout" },
            ],
        });
        logger.info("Prisma client initialized");
    }
    return prisma;
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
    if (prisma) {
        await prisma.$disconnect();
        // @ts-ignore — reset so getPrismaClient creates a fresh one
        prisma = undefined;
        pool = null;
        logger.info("Prisma client disconnected");
    }
}
//# sourceMappingURL=db.js.map