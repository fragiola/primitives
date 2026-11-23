/**
 * A month with no day, no time and no time zone (spec/month-calendar.md, "Values"), Temporal's
 * `PlainYearMonth` shape. `month` is 1–12.
 */
export interface PlainYearMonth {
    readonly year: number;
    readonly month: number;
}

/** A year with no month (an object, so a calendar system can extend it). */
export interface PlainYear {
    readonly year: number;
}

/** A range of months, `start <= end`. */
export interface YearMonthRange {
    readonly start: PlainYearMonth;
    readonly end: PlainYearMonth;
}

/** A range of years, `start <= end`. */
export interface YearRange {
    readonly start: PlainYear;
    readonly end: PlainYear;
}

/**
 * A month as one number (`year * 12 + month - 1`), so the month grid moves by adding: the next
 * month is `+ 1`, the same month of the next year `+ 12`. A year's index is the year itself.
 */
export function monthIndex(month: PlainYearMonth): number {
    return month.year * 12 + month.month - 1;
}

/** The month of a {@link monthIndex}. */
export function fromMonthIndex(index: number): PlainYearMonth {
    const year = Math.floor(index / 12);
    return { year, month: index - year * 12 + 1 };
}

/** The local month of `now` (the clock the page sees). */
export function currentYearMonth(now: Date = new Date()): PlainYearMonth {
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

const pad = (value: number, size: number) =>
    String(Math.abs(value)).padStart(size, "0");

/** `2026-11` (ISO 8601, as `<input type="month">`). */
export function toIsoYearMonth(month: PlainYearMonth): string {
    return `${month.year < 0 ? "-" : ""}${pad(month.year, 4)}-${pad(month.month, 2)}`;
}

/** `2026` (ISO 8601's year: 4 digits). */
export function toIsoYear(year: PlainYear): string {
    return `${year.year < 0 ? "-" : ""}${pad(year.year, 4)}`;
}
