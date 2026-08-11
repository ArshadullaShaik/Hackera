import { describe, expect, it } from "vitest";
import { extractDetailDates } from "./detail-enrichment.js";
describe("detail-enrichment", () => {
    it("extracts explicit event and registration dates without guessing missing values", () => {
        const payload = {
            event: {
                start_at: "2026-08-10T12:00:00+00:00",
                end_at: "2026-08-12T12:00:00+00:00",
                registration_open_at: "2026-07-01T00:00:00+00:00",
                registration_close_at: "2026-07-31T23:59:59+00:00",
            },
        };
        expect(extractDetailDates(payload)).toEqual({
            startsAt: "2026-08-10T12:00:00.000Z",
            endsAt: "2026-08-12T12:00:00.000Z",
            registrationStartsAt: "2026-07-01T00:00:00.000Z",
            registrationEndsAt: "2026-07-31T23:59:59.000Z",
        });
    });
    it("leaves registration fields absent when the detail payload does not provide them", () => {
        expect(extractDetailDates({
            event_start_date: "2026-08-10T12:00:00+00:00",
        })).toEqual({
            startsAt: "2026-08-10T12:00:00.000Z",
        });
    });
    it("treats a bare Deadline label as the registration close date", () => {
        expect(extractDetailDates({
            Deadline: "2026-08-18T01:30:00+05:30",
        })).toEqual({
            registrationEndsAt: "2026-08-17T20:00:00.000Z",
        });
    });
});
//# sourceMappingURL=detail-enrichment.test.js.map