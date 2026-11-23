import type { PlainYearMonth } from "./plain-year-month.ts";

// Formatted from UTC dates with `timeZone: "UTC"`, so no host time zone moves a month
// (the `/time` entry's way).
function utcDate(year: number, month: number): Date {
    const date = new Date(Date.UTC(2000, month - 1, 1));
    date.setUTCFullYear(year);
    return date;
}

function format(
    locale: string,
    options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
    return new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" });
}

/** "Nov" (`Intl` `month: "short"`), or "November" with `"long"`. */
export function formatMonthName(
    locale: string,
    month: PlainYearMonth,
    width: "short" | "long" = "short",
): string {
    return format(locale, { month: width }).format(
        utcDate(month.year, month.month),
    );
}

/** "November 2026" (`Intl` `month: "long", year: "numeric"`). */
export function formatYearMonth(locale: string, month: PlainYearMonth): string {
    return format(locale, { month: "long", year: "numeric" }).format(
        utcDate(month.year, month.month),
    );
}

/** "2026" (`Intl` `year: "numeric"`). */
export function formatYear(locale: string, year: number): string {
    return format(locale, { year: "numeric" }).format(utcDate(year, 1));
}

/** "2016 – 2027" (`Intl.DateTimeFormat#formatRange` of two years). */
export function formatYearSpan(
    locale: string,
    first: number,
    last: number,
): string {
    return format(locale, { year: "numeric" }).formatRange(
        utcDate(first, 1),
        utcDate(last, 1),
    );
}
