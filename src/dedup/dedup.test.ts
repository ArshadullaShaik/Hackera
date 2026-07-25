import { describe, it, expect } from "vitest";
import {
  normalizeTitle,
  titleSimilarity,
  isDateClose,
  DedupService,
} from "./dedup.service.js";

describe("DedupService Utils", () => {
  it("normalizes titles correctly", () => {
    expect(normalizeTitle("  AI & ML Hackathon 2026!  ")).toBe("ai ml hackathon 2026");
    expect(normalizeTitle("CodeStorm: Season 1")).toBe("codestorm season 1");
  });

  it("calculates title similarity with Sorensen-Dice coefficient", () => {
    // Exact or near-exact match
    expect(titleSimilarity("AI Hackathon 2026", "ai hackathon 2026")).toBe(1.0);
    expect(titleSimilarity("Global AI Hackathon 2026", "Global AI Hackathon 2026!")).toBeGreaterThan(0.9);

    // Completely different titles
    expect(titleSimilarity("React Meetup", "Python Conference")).toBeLessThan(0.3);
  });

  it("checks date proximity correctly", () => {
    const d1 = "2026-08-01T10:00:00.000Z";
    const d2 = "2026-08-01T14:00:00.000Z"; // 4 hours later
    const d3 = "2026-08-05T10:00:00.000Z"; // 4 days later

    expect(isDateClose(d1, d2)).toBe(true);
    expect(isDateClose(d1, d3)).toBe(false);
  });

  it("identifies duplicates across different platforms", () => {
    const dedupService = new DedupService();

    const candidate = {
      title: "Global AI Buildathon 2026",
      startsAt: "2026-08-10T09:00:00.000Z",
      sourcePlatform: "devfolio",
    };

    const existingRecords = [
      {
        id: "rec-1",
        title: "Global AI Buildathon 2026 - Summer Edition",
        startsAt: new Date("2026-08-10T10:00:00.000Z"),
        sourcePlatform: "luma",
      },
      {
        id: "rec-2",
        title: "Unrelated Web3 Hack",
        startsAt: new Date("2026-08-10T09:00:00.000Z"),
        sourcePlatform: "luma",
      },
    ];

    const match = dedupService.findDuplicate(candidate, existingRecords);
    expect(match).not.toBeNull();
    expect(match?.id).toBe("rec-1");
  });

  it("ignores potential duplicate if from same platform", () => {
    const dedupService = new DedupService();

    const candidate = {
      title: "Global AI Buildathon 2026",
      startsAt: "2026-08-10T09:00:00.000Z",
      sourcePlatform: "luma",
    };

    const existingRecords = [
      {
        id: "rec-1",
        title: "Global AI Buildathon 2026",
        startsAt: new Date("2026-08-10T09:00:00.000Z"),
        sourcePlatform: "luma",
      },
    ];

    const match = dedupService.findDuplicate(candidate, existingRecords);
    expect(match).toBeNull();
  });
});
