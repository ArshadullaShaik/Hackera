import { Scraper } from "../../core/scraper.interface.js";
import { NormalizedHackathon } from "../../core/schema.js";
export declare class HackerEarthScraper implements Scraper {
    private readonly targetUrl;
    scrape(): Promise<NormalizedHackathon[]>;
    private normalize;
}
//# sourceMappingURL=hackerearth.scraper.d.ts.map