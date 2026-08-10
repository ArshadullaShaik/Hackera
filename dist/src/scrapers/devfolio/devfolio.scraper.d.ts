import { Scraper } from "../../core/scraper.interface.js";
import { NormalizedHackathon } from "../../core/schema.js";
export declare class DevfolioScraper implements Scraper {
    private readonly BASE_URL;
    private readonly TIMEOUT;
    private readonly MAX_EVENTS;
    private readonly DETAIL_CONCURRENCY;
    scrape(): Promise<NormalizedHackathon[]>;
    private mapToNormalized;
    private enrichHackathons;
    private enrichHackathon;
}
//# sourceMappingURL=devfolio.scraper.d.ts.map