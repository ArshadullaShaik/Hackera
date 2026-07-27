import { Scraper } from "../../core/scraper.interface.js";
import { NormalizedHackathon } from "../../core/schema.js";
export declare class UnstopScraper implements Scraper {
    private readonly baseUrl;
    private readonly maxPages;
    scrape(): Promise<NormalizedHackathon[]>;
    private normalize;
}
//# sourceMappingURL=unstop.scraper.d.ts.map