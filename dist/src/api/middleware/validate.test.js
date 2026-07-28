import { describe, it, expect } from "vitest";
import { HackathonQuerySchema } from "./validate.js";
describe("HackathonQuerySchema", () => {
    it("should validate all platform options in UI", () => {
        const platforms = ["luma", "devfolio", "devpost", "mlh", "unstop", "hackerearth", "hackclub", "other"];
        for (const platform of platforms) {
            const result = HackathonQuerySchema.safeParse({ platform });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.platform).toBe(platform);
            }
        }
    });
    it("should convert empty strings to undefined", () => {
        const result = HackathonQuerySchema.safeParse({
            search: "",
            platform: "",
            locationType: "",
            startsAfter: "",
            startsBefore: "",
            includeDuplicates: "",
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.platform).toBeUndefined();
            expect(result.data.search).toBeUndefined();
            expect(result.data.locationType).toBeUndefined();
            expect(result.data.startsAfter).toBeUndefined();
            expect(result.data.startsBefore).toBeUndefined();
            expect(result.data.includeDuplicates).toBeUndefined();
        }
    });
    it("should reject invalid platform", () => {
        const result = HackathonQuerySchema.safeParse({ platform: "invalid_platform" });
        expect(result.success).toBe(false);
    });
});
//# sourceMappingURL=validate.test.js.map