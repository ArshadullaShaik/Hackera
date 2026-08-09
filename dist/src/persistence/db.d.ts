import { PrismaClient } from "@prisma/client";
export declare function getPrismaClient(): PrismaClient;
/**
 * Force-recreate the Prisma client (e.g. after a connection loss).
 * Drains the old pool first.
 */
export declare function recreatePrismaClient(): Promise<PrismaClient>;
export declare function disconnectPrisma(): Promise<void>;
//# sourceMappingURL=db.d.ts.map