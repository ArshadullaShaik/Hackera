/**
 * Helper utilities for location type classification, track detection, and prize pool extraction.
 */
export type LocationType = "in-person" | "online" | "hybrid";
/**
 * Determine location type accurately based on scrapers' raw signals.
 */
export declare function determineLocationType(params: {
    isVirtual?: boolean;
    isOnline?: boolean;
    isHybrid?: boolean;
    formatType?: string;
    region?: string;
    locationName?: string;
    city?: string;
    address?: string;
    country?: string;
}): LocationType;
/**
 * Detect hackathon tracks based on title, description, and raw payload tags/themes.
 */
export declare function detectTracks(title: string, description?: string, rawPayload?: any): string[];
/**
 * Extract formatted prize pool ($ or ₹) from raw payload or text.
 */
export declare function extractPrizePool(rawPayload?: any, textContent?: string): string;
/**
 * Format a rich description including tracks and prize pool.
 */
export declare function formatDescription(baseDescription?: string, tracks?: string[], prizePool?: string): string;
//# sourceMappingURL=enrichment.d.ts.map