import { describe, expect, it } from "vitest";
import { MemoryCache } from "./cache.js";
describe("MemoryCache", () => {
    it("stores and retrieves cached values within TTL", () => {
        const cache = new MemoryCache(1000);
        cache.set("key1", "value1");
        expect(cache.get("key1")).toBe("value1");
    });
    it("returns undefined for expired keys", async () => {
        const cache = new MemoryCache(10);
        cache.set("key2", "value2");
        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(cache.get("key2")).toBeUndefined();
    });
    it("evicts oldest keys when maxEntries capacity is reached", () => {
        const cache = new MemoryCache(1000, 2);
        cache.set("k1", "v1");
        cache.set("k2", "v2");
        cache.set("k3", "v3");
        expect(cache.get("k1")).toBeUndefined();
        expect(cache.get("k2")).toBe("v2");
        expect(cache.get("k3")).toBe("v3");
    });
});
//# sourceMappingURL=cache.test.js.map