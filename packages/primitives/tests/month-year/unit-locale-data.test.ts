import { describe, expect, it } from "vitest";
import {
    formatMonthName,
    formatYear,
    formatYearMonth,
    formatYearSpan,
} from "../../src/month-year/unit-locale-data.ts";

// the expected strings come from `Intl` too (its structure is asserted, not its literals)
const expected = (locale: string, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" });

describe("the month and year locale data", () => {
    it("names a month as Intl does, whatever the host's time zone", () => {
        const november = new Date(Date.UTC(2026, 10, 1));
        for (const locale of ["en-US", "de-DE", "ja-JP"]) {
            expect(formatMonthName(locale, { year: 2026, month: 11 })).toBe(
                expected(locale, { month: "short" }).format(november),
            );
            expect(
                formatMonthName(locale, { year: 2026, month: 11 }, "long"),
            ).toBe(expected(locale, { month: "long" }).format(november));
            expect(formatYearMonth(locale, { year: 2026, month: 11 })).toBe(
                expected(locale, { month: "long", year: "numeric" }).format(
                    november,
                ),
            );
        }
    });

    it("writes a year and a page of years", () => {
        expect(formatYear("en-US", 2026)).toContain("2026");
        const span = formatYearSpan("en-US", 2016, 2027);
        expect(span).toContain("2016");
        expect(span).toContain("2027");
        expect(span.indexOf("2016")).toBeLessThan(span.indexOf("2027"));
    });

    it("formats the years before 100 as themselves", () => {
        expect(formatYear("en-US", 42)).toContain("42");
        expect(formatYear("en-US", 42)).not.toContain("1942");
    });
});

describe("formatYearSpan's spaces", () => {
    it("writes every space as U+0020, whatever the engine's ICU writes", () => {
        expect(formatYearSpan("en-US", 2016, 2027)).not.toMatch(/[   ]/);
    });
});
