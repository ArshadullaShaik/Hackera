export declare class MemoryCache<T> {
    private defaultTtlMs;
    private maxEntries;
    private cache;
    constructor(defaultTtlMs?: number, maxEntries?: number);
    get(key: string): T | undefined;
    set(key: string, value: T, ttlMs?: number): void;
    clear(): void;
    size(): number;
}
export declare const apiQueryCache: MemoryCache<{
    data: any[];
    meta: any;
}>;
//# sourceMappingURL=cache.d.ts.map