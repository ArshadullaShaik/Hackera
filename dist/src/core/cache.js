export class MemoryCache {
    constructor(defaultTtlMs = 60000, maxEntries = 200) {
        this.defaultTtlMs = defaultTtlMs;
        this.maxEntries = maxEntries;
        this.cache = new Map();
    }
    get(key) {
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
    set(key, value, ttlMs) {
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
    clear() {
        this.cache.clear();
    }
    size() {
        return this.cache.size;
    }
}
// Global API query cache instance (60s default TTL)
export const apiQueryCache = new MemoryCache(60000, 300);
//# sourceMappingURL=cache.js.map