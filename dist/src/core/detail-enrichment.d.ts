export interface HackathonDetailDates {
    startsAt?: string;
    endsAt?: string;
    registrationStartsAt?: string;
    registrationEndsAt?: string;
}
export declare function extractDetailDates(detailPayload: unknown): HackathonDetailDates;
export declare function mergeRawSourcePayload(basePayload: unknown, detailPayload: unknown): Record<string, unknown>;
export declare function mapWithConcurrency<T, U>(items: T[], concurrency: number, mapper: (item: T, index: number) => Promise<U>): Promise<U[]>;
export declare function fetchDetailPayload(url: string, timeout: number, headers?: Record<string, string>): Promise<unknown>;
//# sourceMappingURL=detail-enrichment.d.ts.map