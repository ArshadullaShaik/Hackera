import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { DevfolioScraper } from "./devfolio.scraper.js";

vi.mock("axios");

describe("DevfolioScraper", () => {
  let scraper: DevfolioScraper;

  beforeEach(() => {
    scraper = new DevfolioScraper();
    vi.clearAllMocks();
  });

  it("extracts and normalizes Devfolio hackathons from embedded JSON", async () => {
    const embeddedData = {
      open_hackathons: [
        {
          uuid: "devfolio-uuid-1",
          slug: "test-devfolio-hack",
          name: "Test Devfolio Hackathon",
          starts_at: "2026-09-01T06:00:00+00:00",
          ends_at: "2026-09-03T18:00:00+00:00",
          is_online: true,
        },
      ],
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <script>
            window.__data__ = ${JSON.stringify(embeddedData)};
          </script>
        </head>
        <body></body>
      </html>
    `;

    vi.mocked(axios.get).mockResolvedValueOnce({ data: htmlContent });

    const events = await scraper.scrape();

    expect(events.length).toBe(1);
    expect(events[0]).toMatchObject({
      title: "Test Devfolio Hackathon",
      sourceId: "devfolio-uuid-1",
      sourcePlatform: "devfolio",
      canonicalUrl: "https://devfolio.co/test-devfolio-hack",
      locationType: "online",
    });
  });

  it("throws error when page HTML contains no hackathon data (fail-fast)", async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: "<html><body>No scripts here</body></html>",
    });

    await expect(scraper.scrape()).rejects.toThrow();
  });
});
