import { Scraper } from "../../core/scraper.interface.js";
import { NormalizedHackathon } from "../../core/schema.js";
export declare class LumaScraper implements Scraper {
    private readonly BASE_URL;
    private readonly DISCOVER_PLACE_ID;
    private readonly PAGINATION_LIMIT;
    private readonly TIMEOUT;
    private readonly MAX_PAGES;
    private readonly DETAIL_CONCURRENCY;
    scrape(): Promise<NormalizedHackathon[]>;
    private mapToNormalized;
    private enrichHackathons;
    private enrichHackathon;
}
//# sourceMappingURL=luma.scraper.d.ts.map