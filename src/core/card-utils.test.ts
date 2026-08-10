import { describe, expect, it } from "vitest";
import { formatCardDate, resolvePrizeText } from "./card-utils.js";

describe("card-utils", () => {
  it("formats UTC calendar dates consistently", () => {
    expect(formatCardDate("2026-08-10T18:30:00.000Z")).toBe("Aug 10");
  });

  it("resolves prize text from description metadata first", () => {
    expect(
      resolvePrizeText({
        title: "Hackathon",
        description: "[Prize Pool: $10,000 | Tracks: AI / ML] Build awesome things",
        startsAt: "2026-08-10T00:00:00.000Z",
      })
    ).toBe("🏆 $10,000");
  });

  it("falls back through prize_amount, prize_money, prize arrays and text patterns", () => {
    expect(
      resolvePrizeText({
        title: "Hackathon",
        description: "",
        startsAt: "2026-08-10T00:00:00.000Z",
        rawSourcePayload: { prize_amount: "₹50,000" },
      })
    ).toBe("🏆 ₹50,000");

    expect(
      resolvePrizeText({
        title: "Hackathon",
        description: "",
        startsAt: "2026-08-10T00:00:00.000Z",
        rawSourcePayload: { prize_money: "50000" },
      })
    ).toBe("🏆 ₹50000");

    expect(
      resolvePrizeText({
        title: "Hackathon",
        description: "",
        startsAt: "2026-08-10T00:00:00.000Z",
        rawSourcePayload: { prizes: [{ cash: "$25,000" }] },
      })
    ).toBe("🏆 $25,000");

    expect(
      resolvePrizeText({
        title: "Hackathon",
        description: "Winner gets INR 1,00,000 in prizes",
        startsAt: "2026-08-10T00:00:00.000Z",
      })
    ).toBe("🏆 ₹1,00,000");

    expect(
      resolvePrizeText({
        title: "Hackathon",
        description: "No explicit prize data",
        startsAt: "2026-08-10T00:00:00.000Z",
      })
    ).toBe("🏆 Prizes Available");
  });
});
