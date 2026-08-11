import { Scraper } from "../../core/scraper.interface.js";
import { NormalizedHackathon } from "../../core/schema.js";
export declare class DoraHacksScraper implements Scraper {
    private readonly baseUrl;
    private readonly userAgent;
    private readonly detailConcurrency;
    private fetchSlugsWithPlaywright;
    scrape(): Promise<NormalizedHackathon[]>;
    normalize(raw: any): NormalizedHackathon | null;
}
//# sourceMappingURL=dorahacks.scraper.d.ts.map