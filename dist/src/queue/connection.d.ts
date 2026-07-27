import IORedis from "ioredis";
/**
 * Shared Redis connection config for BullMQ.
 * Reuses the same IORedis instance for queue + worker.
 */
export declare function createRedisConnection(): IORedis;
//# sourceMappingURL=connection.d.ts.map