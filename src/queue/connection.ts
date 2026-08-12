import IORedis from "ioredis";

/**
 * Shared Redis connection config for BullMQ.
 * Reuses the same IORedis instance for queue + worker.
 * Supports REDIS_URL (Railway) or REDIS_HOST/REDIS_PORT (local dev).
 */
export function createRedisConnection(): IORedis {
  // Railway provides a single REDIS_URL; prefer it over host/port
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    return new IORedis(redisUrl, {
      maxRetriesPerRequest: null, // Required by BullMQ
    });
  }

  const host = process.env.REDIS_HOST || "localhost";
  const port = parseInt(process.env.REDIS_PORT || "6379", 10);

  return new IORedis(port, host, {
    maxRetriesPerRequest: null, // Required by BullMQ
  });
}
