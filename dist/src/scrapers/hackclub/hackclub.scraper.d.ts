import { Scraper } from "../../core/scraper.interface.js";
import { NormalizedHackathon } from "../../core/schema.js";
export declare class HackClubScraper implements Scraper {
    private readonly targetUrl;
    scrape(): Promise<NormalizedHackathon[]>;
    private normalize;
}
//# sourceMappingURL=hackclub.scraper.d.ts.map