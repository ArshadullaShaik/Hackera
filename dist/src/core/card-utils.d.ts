export interface CardHackathonItem {
    title: string;
    description?: string;
    startsAt: string;
    registrationStartsAt?: string;
    registrationEndsAt?: string;
    rawSourcePayload?: any;
}
export declare function formatCardDate(value?: string): string | null;
export declare function resolvePrizeText(item: CardHackathonItem): string;
export declare function resolveTrackBadges(item: CardHackathonItem): string[];
//# sourceMappingURL=card-utils.d.ts.map