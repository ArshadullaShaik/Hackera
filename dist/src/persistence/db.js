import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { logger } from "../core/logger";
let prisma;
export function getPrismaClient() {
    if (!prisma) {
        const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
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
export async function disconnectPrisma() {
    if (prisma) {
        await prisma.$disconnect();
        logger.info("Prisma client disconnected");
    }
}
//# sourceMappingURL=db.js.map