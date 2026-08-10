import { Scraper } from "../../core/scraper.interface.js";
import { NormalizedHackathon } from "../../core/schema.js";
export declare class UnstopScraper implements Scraper {
    private readonly baseUrl;
    private readonly maxPages;
    private readonly detailConcurrency;
    private readonly detailTimeout;
    scrape(): Promise<NormalizedHackathon[]>;
    private normalize;
    private enrichHackathons;
    private enrichHackathon;
}
//# sourceMappingURL=unstop.scraper.d.ts.map