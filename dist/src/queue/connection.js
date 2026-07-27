import IORedis from "ioredis";
/**
 * Shared Redis connection config for BullMQ.
 * Reuses the same IORedis instance for queue + worker.
 */
export function createRedisConnection() {
    const host = process.env.REDIS_HOST || "localhost";
    const port = parseInt(process.env.REDIS_PORT || "6379", 10);
    return new IORedis(port, host, {
        maxRetriesPerRequest: null, // Required by BullMQ
    });
}
//# sourceMappingURL=connection.js.map