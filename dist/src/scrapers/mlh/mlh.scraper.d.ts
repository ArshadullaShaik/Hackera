import { Scraper } from "../../core/scraper.interface.js";
import { NormalizedHackathon } from "../../core/schema.js";
export declare class MLHScraper implements Scraper {
    private readonly targetUrl;
    scrape(): Promise<NormalizedHackathon[]>;
    private normalize;
}
//# sourceMappingURL=mlh.scraper.d.ts.map