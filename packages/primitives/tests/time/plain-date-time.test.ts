import { describe, expect, it } from "vitest";
import {
    addDateTime,
    compareDateTimes,
    currentDateTime,
    fromIsoDateTime,
    isSameDateTime,
    plainDateTime,
    toIsoDateTime,
    toPlainDate,
    toPlainTime,
} from "../../src/time/plain-date-time.ts";

const date = { year: 2026, month: 11, day: 23 };

// spec/date-field.md, "Values": a PlainDate and a PlainTime in one flat object
describe("plainDateTime", () => {
    it("joins a date and a time, midnight by default, normalizing overflow", () => {
        expect(plainDateTime(date, { hour: 14, minute: 30 })).toEqual({
            ...date,
            hour: 14,
            minute: 30,
            second: 0,
            millisecond: 0,
        });
        expect(plainDateTime(date)).toEqual(plainDateTime(date, { hour: 0 }));
        expect(plainDateTime(date, { hour: 24 })).toEqual(
            plainDateTime({ year: 2026, month: 11, day: 24 }),
        );
        // years 0–99 stay themselves (Date.UTC would read them as 19xx)
        expect(plainDateTime({ year: 26, month: 1, day: 1 }).year).toBe(26);
    });

    it("splits into its date and its time", () => {
        const value = plainDateTime(date, { hour: 9, minute: 5 });
        expect(toPlainDate(value)).toEqual(date);
        expect(toPlainTime(value)).toEqual({
            hour: 9,
            minute: 5,
            second: 0,
            millisecond: 0,
        });
    });

    it("reads the clock it is given", () => {
        expect(currentDateTime(new Date(2026, 10, 23, 9, 5))).toEqual(
            plainDateTime(date, { hour: 9, minute: 5 }),
        );
    });

    it("compares, a plain date counting as its midnight", () => {
        const morning = plainDateTime(date, { hour: 9 });
        expect(compareDateTimes(morning, date)).toBeGreaterThan(0);
        expect(compareDateTimes(plainDateTime(date), date)).toBe(0);
        expect(
            compareDateTimes(morning, plainDateTime({ ...date, day: 24 })),
        ).toBeLessThan(0);
        expect(isSameDateTime(morning, plainDateTime(date, { hour: 9 }))).toBe(
            true,
        );
        expect(isSameDateTime(morning, undefined)).toBe(false);
    });

    it("adds months clamped to the month's end, then days and time with a carry", () => {
        const late = plainDateTime(
            { year: 2026, month: 1, day: 31 },
            { hour: 23 },
        );
        expect(addDateTime(late, { months: 1 })).toEqual(
            plainDateTime({ year: 2026, month: 2, day: 28 }, { hour: 23 }),
        );
        expect(addDateTime(late, { hours: 2 })).toEqual(
            plainDateTime({ year: 2026, month: 2, day: 1 }, { hour: 1 }),
        );
        expect(addDateTime(late, { years: -1, days: 1 })).toEqual(
            plainDateTime({ year: 2025, month: 2, day: 1 }, { hour: 23 }),
        );
    });

    it("writes and parses ISO date-times", () => {
        const value = plainDateTime(date, { hour: 14, minute: 30 });
        expect(toIsoDateTime(value)).toBe("2026-11-23T14:30");
        expect(toIsoDateTime(value, "second")).toBe("2026-11-23T14:30:00");
        expect(fromIsoDateTime("2026-11-23T14:30")).toEqual(value);
        expect(fromIsoDateTime("2026-11-23T14:30:05.5")).toEqual({
            ...value,
            second: 5,
            millisecond: 500,
        });
        for (const text of [
            "2026-02-30T10:00",
            "2026-11-23",
            "2026-11-23T25:00",
            "2026-11-23 14:30",
        ]) {
            expect(fromIsoDateTime(text)).toBeNull();
        }
    });
});
