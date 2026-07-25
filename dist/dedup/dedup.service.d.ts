/**
 * Normalize title by converting to lowercase, replacing special characters and stripping extra whitespace.
 */
export declare function normalizeTitle(title: string): string;
/**
 * Compute Sorensen-Dice similarity coefficient for two strings.
 * Returns a value between 0 and 1.
 */
export declare function titleSimilarity(a: string, b: string): number;
/**
 * Check if two dates fall within a tolerance window (default 24 hours).
 */
export declare function isDateClose(dateA: Date | string, dateB: Date | string, toleranceMs?: number): boolean;
export interface ExistingHackathonRecord {
    id: string;
    title: string;
    startsAt: Date;
    sourcePlatform: string;
    description?: string | null;
    locationName?: string | null;
    imageUrl?: string | null;
    duplicateOfId?: string | null;
}
export declare class DedupService {
    private readonly SIMILARITY_THRESHOLD;
    private readonly TIME_TOLERANCE_MS;
    /**
     * Find matching existing hackathon from a DIFFERENT platform.
     * Returns matching existing ID if duplicate found, or null if unique.
     */
    findDuplicate(candidate: {
        title: string;
        startsAt: string | Date;
        sourcePlatform: string;
    }, existingList: ExistingHackathonRecord[]): ExistingHackathonRecord | null;
}
//# sourceMappingURL=dedup.service.d.ts.map