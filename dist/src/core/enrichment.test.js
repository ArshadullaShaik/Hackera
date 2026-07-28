import { describe, it, expect } from "vitest";
import { determineLocationType, detectTracks, extractPrizePool, formatDescription, } from "./enrichment.js";
describe("Enrichment Module", () => {
    describe("determineLocationType", () => {
        it("classifies in-person events accurately when physical attributes are present", () => {
            const type = determineLocationType({
                city: "San Francisco",
                country: "USA",
                isHybrid: false,
            });
            expect(type).toBe("in-person");
        });
        it("does not classify in-person event as online when isHybrid is false", () => {
            const type = determineLocationType({
                locationName: "Bengaluru, Karnataka, India",
                isHybrid: false,
            });
            expect(type).toBe("in-person");
        });
        it("classifies explicit virtual/online events correctly", () => {
            const type = determineLocationType({
                isVirtual: true,
            });
            expect(type).toBe("online");
        });
        it("classifies hybrid events correctly", () => {
            const type = determineLocationType({
                isHybrid: true,
            });
            expect(type).toBe("hybrid");
        });
    });
    describe("detectTracks", () => {
        it("detects Game Dev track", () => {
            const tracks = detectTracks("Indie Game Jam 2026", "Build 3D games with Unity and Unreal");
            expect(tracks).toContain("Game Dev");
        });
        it("detects AI / ML track", () => {
            const tracks = detectTracks("GenAI Buildathon", "Build LLM applications with OpenAI API");
            expect(tracks).toContain("AI / ML");
        });
        it("defaults to Open Innovation when no specific track keywords match", () => {
            const tracks = detectTracks("General Student Hack", "Build anything you want");
            expect(tracks).toContain("Open Innovation");
        });
    });
    describe("extractPrizePool", () => {
        it("extracts USD prize pool", () => {
            const pool = extractPrizePool({ prize_amount: "$50,000" }, "Total prize pool $50,000");
            expect(pool).toBe("$50,000");
        });
        it("extracts INR prize pool", () => {
            const pool = extractPrizePool({}, "Grand prize pool INR 5,000,000 for top teams");
            expect(pool).toBe("₹5,000,000");
        });
    });
    describe("formatDescription", () => {
        it("formats description with tracks and prize pool header", () => {
            const formatted = formatDescription("Build cool apps", ["Game Dev", "AI / ML"], "$10,000");
            expect(formatted).toContain("[Tracks: Game Dev, AI / ML | Prize Pool: $10,000]");
            expect(formatted).toContain("Build cool apps");
        });
    });
});
//# sourceMappingURL=enrichment.test.js.map