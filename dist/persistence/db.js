import { PrismaClient } from "@prisma/client";
import { logger } from "../core/logger.js";
let prisma;
export function getPrismaClient() {
    if (!prisma) {
        prisma = new PrismaClient({
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