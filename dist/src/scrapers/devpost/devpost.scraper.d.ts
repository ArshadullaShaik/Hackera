import { Scraper } from "../../core/scraper.interface.js";
import { NormalizedHackathon } from "../../core/schema.js";
export declare class DevpostScraper implements Scraper {
    private readonly baseUrl;
    private readonly detailConcurrency;
    private readonly detailTimeout;
    scrape(): Promise<NormalizedHackathon[]>;
    private normalize;
    private enrichHackathons;
    private enrichHackathon;
}
//# sourceMappingURL=devpost.scraper.d.ts.map