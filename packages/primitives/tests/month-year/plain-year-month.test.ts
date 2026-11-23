import { describe, expect, it } from "vitest";
import {
    currentYearMonth,
    fromMonthIndex,
    monthIndex,
    toIsoYear,
    toIsoYearMonth,
} from "../../src/month-year/plain-year-month.ts";

describe("monthIndex", () => {
    it("numbers the months so that adding moves by months", () => {
        expect(monthIndex({ year: 2026, month: 1 }) + 12).toBe(
            monthIndex({ year: 2027, month: 1 }),
        );
        expect(
            fromMonthIndex(monthIndex({ year: 2026, month: 11 }) + 2),
        ).toEqual({ year: 2027, month: 1 });
        expect(
            fromMonthIndex(monthIndex({ year: 2026, month: 1 }) - 1),
        ).toEqual({ year: 2025, month: 12 });
    });
});

describe("currentYearMonth", () => {
    it("is the local month of the clock", () => {
        expect(currentYearMonth(new Date(2026, 10, 20, 10))).toEqual({
            year: 2026,
            month: 11,
        });
    });
});

describe("ISO text", () => {
    it("writes a month as YYYY-MM and a year with 4 digits", () => {
        expect(toIsoYearMonth({ year: 2026, month: 3 })).toBe("2026-03");
        expect(toIsoYearMonth({ year: 987, month: 12 })).toBe("0987-12");
        expect(toIsoYear({ year: 2026 })).toBe("2026");
        expect(toIsoYear({ year: 42 })).toBe("0042");
    });
});
