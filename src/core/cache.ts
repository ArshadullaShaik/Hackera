interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class MemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();

  constructor(private defaultTtlMs: number = 60_000, private maxEntries: number = 200) {}

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: string, value: T, ttlMs?: number): void {
    // Evict oldest entry if at capacity
    if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const expiresAt = Date.now() + (ttlMs ?? this.defaultTtlMs);
    this.cache.set(key, { value, expiresAt });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global API query cache instance (60s default TTL)
export const apiQueryCache = new MemoryCache<{ data: any[]; meta: any }>(60_000, 300);
