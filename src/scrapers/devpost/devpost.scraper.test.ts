import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { DevpostScraper } from "./devpost.scraper.js";

vi.mock("axios");

const rawHackathon = (id: number) => ({
  id,
  title: `Devpost Hackathon ${id}`,
  url: `https://example.devpost.com/${id}`,
  submission_period_dates: "Aug 1 - 2, 2026",
});

describe("DevpostScraper", () => {
  beforeEach(() => vi.clearAllMocks());

  it("follows Devpost pagination metadata for all open and upcoming hackathons", async () => {
    vi.mocked(axios.get)
      .mockResolvedValueOnce({
        data: {
          hackathons: [rawHackathon(1)],
          meta: { total_count: 18, per_page: 9 },
        },
      })
      .mockResolvedValueOnce({
        data: {
          hackathons: [rawHackathon(2)],
          meta: { total_count: 18, per_page: 9 },
        },
      });

    const events = await new DevpostScraper().scrape();

    expect(events).toHaveLength(2);
    expect(axios.get).toHaveBeenCalledTimes(4);
    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      "https://devpost.com/api/hackathons",
      expect.objectContaining({
        params: expect.objectContaining({
          order_by: "recently-added",
          "status[]": ["upcoming", "open"],
          page: 1,
        }),
      })
    );
    expect(axios.get).toHaveBeenNthCalledWith(
      2,
      "https://devpost.com/api/hackathons",
      expect.objectContaining({
        params: expect.objectContaining({
          order_by: "recently-added",
          "status[]": ["upcoming", "open"],
          page: 2,
        }),
      })
    );

    expect(events[0]).toMatchObject({
      startsAt: "2026-08-01T00:00:00.000Z",
      endsAt: "2026-08-02T23:59:59.999Z",
    });
  });
});
