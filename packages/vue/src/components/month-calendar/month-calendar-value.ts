import {
    fromMonthIndex,
    monthIndex,
    type PlainYear,
    type PlainYearMonth,
} from "@fragiola/primitives/month-year";

/** What a month or year calendar's items are: months, or years (spec/month-calendar.md). */
export type MonthCalendarKind = "month" | "year";
/** One item, or a range of them. */
export type MonthCalendarMode = "single" | "range";

/** One month or year. */
export type MonthCalendarItem = PlainYearMonth | PlainYear;
/** A calendar's value: an item, a range of items, or `null`. */
export type MonthCalendarValue =
    | MonthCalendarItem
    | { start: MonthCalendarItem; end: MonthCalendarItem }
    | null;

/** The options a month or year calendar takes, and its picker or view passes to it. */
export interface MonthCalendarOptions {
    /** Items before it are disabled. */
    min?: MonthCalendarItem | null;
    /** Items after it are disabled. */
    max?: MonthCalendarItem | null;
    /** Unavailable items can be focused but not chosen. */
    isUnavailable?(item: MonthCalendarItem): boolean;
    /** A BCP 47 tag (default: the document's `lang`, then the browser's). */
    locale?: string;
    /** Items per row (default 3). */
    columns?: number;
}

/** An item as a number: a month's `monthIndex`, a year's year. */
export function itemIndex(kind: MonthCalendarKind, item: MonthCalendarItem) {
    return kind === "month"
        ? monthIndex(item as PlainYearMonth)
        : (item as PlainYear).year;
}

/** The item of a number. */
export function itemOf(
    kind: MonthCalendarKind,
    index: number,
): MonthCalendarItem {
    return kind === "month" ? fromMonthIndex(index) : { year: index };
}

export function isItemRange(
    value: MonthCalendarValue,
): value is { start: MonthCalendarItem; end: MonthCalendarItem } {
    return value !== null && "start" in value;
}
