import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { DevpostScraper } from "./devpost.scraper.js";
vi.mock("axios");
const hackathon = {
    id: 29541,
    title: "Build with Gemini XPRIZE",
    url: "https://xprize.devpost.com/",
    displayed_location: { icon: "globe", location: "Online" },
    submission_period_dates: "Dec 30 - Jan 02, 2027",
    thumbnail_url: "//example.com/image.png",
    prize_amount: "$<span>2,000</span>",
    organization_name: "XPRIZE",
};
describe("DevpostScraper", () => {
    beforeEach(() => vi.clearAllMocks());
    it("uses the public listing request headers and normalizes returned hackathons", async () => {
        vi.mocked(axios.get)
            .mockResolvedValueOnce({ data: { hackathons: [hackathon] } })
            .mockResolvedValueOnce({ data: { hackathons: [] } });
        const events = await new DevpostScraper().scrape();
        expect(axios.get).toHaveBeenCalledWith("https://devpost.com/api/hackathons", expect.objectContaining({
            headers: expect.objectContaining({
                Accept: "*/*",
                Referer: "https://devpost.com/hackathons",
                "Sec-Fetch-Site": "same-origin",
            }),
        }));
        expect(events).toHaveLength(1);
        expect(events[0]).toMatchObject({
            title: hackathon.title,
            startsAt: "2026-12-30T00:00:00.000Z",
            endsAt: "2027-01-02T00:00:00.000Z",
            locationType: "online",
            imageUrl: "https://example.com/image.png",
        });
    });
    it("fails fast when Devpost rejects the listing request", async () => {
        vi.mocked(axios.get).mockRejectedValueOnce(new Error("Request failed with status code 403"));
        await expect(new DevpostScraper().scrape()).rejects.toThrow("Devpost scrape failed: network error");
    });
});
//# sourceMappingURL=devpost.scraper.test.js.map