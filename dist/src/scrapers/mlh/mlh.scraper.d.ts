import { Scraper } from "../../core/scraper.interface.js";
import { NormalizedHackathon } from "../../core/schema.js";
export declare class MLHScraper implements Scraper {
    private readonly targetUrl;
    private readonly detailConcurrency;
    private readonly detailTimeout;
    scrape(): Promise<NormalizedHackathon[]>;
    private normalize;
    private enrichHackathons;
    private enrichHackathon;
}
//# sourceMappingURL=mlh.scraper.d.ts.map