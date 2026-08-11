import { describe, expect, it } from "vitest";
import { DoraHacksScraper } from "./dorahacks.scraper.js";

describe("DoraHacksScraper", () => {
  const scraper = new DoraHacksScraper();

  it("normalizes a valid DoraHacks raw record correctly", () => {
    const raw = {
      id: 2286,
      uname: "weex-ai-wars2",
      title: "WEEX AI Wars II: Rise of Intelligence",
      imageUrl: "https://cdn.dorahacks.io/static/files/19f3babdef976002263ee6b47de848d8.jpeg",
      ecosystem: "WEEX,Al Trading,Hackathon,Web3,Crypto",
      tags: "Al,Trading,Algorithmic,Web3,Crypto,Risk Management",
      timelineStart: 1782792000,
      timelineEnd: 1788191940,
      venueForm: "Virtual",
      bonusPrice: 200000,
      bonusToken: "USD",
      description: "Trade your way in AI trading competition",
    };

    const normalized = scraper.normalize(raw);
    expect(normalized).not.toBeNull();
    expect(normalized?.sourcePlatform).toBe("dorahacks");
    expect(normalized?.sourceId).toBe("2286");
    expect(normalized?.title).toBe("WEEX AI Wars II: Rise of Intelligence");
    expect(normalized?.canonicalUrl).toBe("https://dorahacks.io/hackathon/weex-ai-wars2/");
    expect(normalized?.locationType).toBe("online");
    expect(normalized?.imageUrl).toBe("https://cdn.dorahacks.io/static/files/19f3babdef976002263ee6b47de848d8.jpeg");
    expect(normalized?.startsAt).toBe(new Date(1782792000 * 1000).toISOString());
    expect(normalized?.endsAt).toBe(new Date(1788191940 * 1000).toISOString());
    expect(normalized?.description).toContain("Prize Pool: $200,000");
  });

  it("returns null for malformed record without timelineStart or title", () => {
    expect(scraper.normalize({ id: 123, title: "Test" })).toBeNull();
    expect(scraper.normalize({ id: 123, timelineStart: 1782792000 })).toBeNull();
  });
});
