import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { LumaScraper } from "./luma.scraper.js";

vi.mock("axios");

describe("LumaScraper", () => {
  let scraper: LumaScraper;

  beforeEach(() => {
    scraper = new LumaScraper();
    vi.clearAllMocks();
  });

  it("successfully scrapes and normalizes Luma API events", async () => {
    const mockApiResponse = {
      data: {
        entries: [
          {
            event: {
              api_id: "evt-test-123",
              name: "Test Hackathon 2026",
              description: "A cool test hackathon",
              cover_url: "https://example.com/image.png",
              start_at: "2026-08-01T10:00:00.000Z",
              end_at: "2026-08-02T10:00:00.000Z",
              url: "test-hack-2026",
              location_type: "offline",
              geo_address_info: {
                full_address: "Bengaluru, Karnataka, India",
              },
            },
          },
        ],
        next_cursor: null,
      },
    };

    vi.mocked(axios.get).mockResolvedValueOnce(mockApiResponse);

    const events = await scraper.scrape();

    expect(events.length).toBe(1);
    expect(events[0]).toMatchObject({
      title: "Test Hackathon 2026",
      sourceId: "evt-test-123",
      sourcePlatform: "luma",
      canonicalUrl: "https://lu.ma/test-hack-2026",
      locationType: "in-person",
      locationName: "Bengaluru, Karnataka, India",
    });
  });

  it("handles malformed entries gracefully (fail-soft)", async () => {
    const mockApiResponse = {
      data: {
        entries: [
          {
            event: {
              // missing api_id and name, should fail validation
              start_at: "invalid-date",
            },
          },
          {
            event: {
              api_id: "evt-valid-456",
              name: "Valid Hackathon",
              start_at: "2026-08-01T10:00:00.000Z",
              url: "valid-hack",
            },
          },
        ],
        next_cursor: null,
      },
    };

    vi.mocked(axios.get).mockResolvedValueOnce(mockApiResponse);

    const events = await scraper.scrape();

    expect(events.length).toBe(1);
    expect(events[0].title).toBe("Valid Hackathon");
  });

  it("throws an error when API envelope is invalid (fail-fast)", async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: { invalid_key: true },
    });

    await expect(scraper.scrape()).rejects.toThrow();
  });
});
