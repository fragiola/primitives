import type {
    CalendarSystem,
    CalendarUnits,
} from "@fragiola/primitives/calendar-systems";
import {
    formatMonthName,
    formatYear,
    formatYearMonth,
    formatYearSpan,
    fromMonthIndex,
    monthIndex,
    type PlainYear,
    type PlainYearMonth,
    toIsoYear,
    toIsoYearMonth,
    UNIT_PAGE_SIZE,
    unitKeyTarget,
    unitPageStart,
    unitRows,
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
    /**
     * A calendar system from `@fragiola/primitives/calendar-systems` (spec/calendar-systems.md):
     * the items are its months (a page is its year) or years, and so are the values.
     */
    calendar?: CalendarSystem;
}

/** What a month or year calendar's items are: a calendar system's units, or the ISO calendar's. */
export type MonthCalendarUnits = Pick<
    CalendarUnits,
    | "index"
    | "item"
    | "pageStart"
    | "pageSize"
    | "rows"
    | "keyTarget"
    | "text"
    | "name"
    | "heading"
    | "iso"
>;

const size = () => UNIT_PAGE_SIZE;

/** The ISO calendar's months and years (`/month-year`), when no system is given. */
export const ISO_UNITS: Record<MonthCalendarKind, MonthCalendarUnits> = {
    month: {
        index: (item) => monthIndex(item as PlainYearMonth),
        item: fromMonthIndex,
        pageStart: unitPageStart,
        pageSize: size,
        rows: unitRows,
        keyTarget: unitKeyTarget,
        text: (locale, index) =>
            formatMonthName(locale, fromMonthIndex(index), "long"),
        name: (locale, index) => formatYearMonth(locale, fromMonthIndex(index)),
        heading: (locale, start) => formatYear(locale, start / UNIT_PAGE_SIZE),
        iso: (index) => toIsoYearMonth(fromMonthIndex(index)),
    },
    year: {
        index: (item) => item.year,
        item: (year) => ({ year }),
        pageStart: unitPageStart,
        pageSize: size,
        rows: unitRows,
        keyTarget: unitKeyTarget,
        text: formatYear,
        name: formatYear,
        heading: (locale, start) =>
            formatYearSpan(locale, start, start + UNIT_PAGE_SIZE - 1),
        iso: (year) => toIsoYear({ year }),
    },
};

/** The units of a kind: the calendar system's, else the ISO calendar's. */
export function unitsOf(
    kind: MonthCalendarKind,
    calendar: CalendarSystem | undefined,
): MonthCalendarUnits {
    return calendar ? calendar.units(kind) : ISO_UNITS[kind];
}

export function isItemRange(
    value: MonthCalendarValue,
): value is { start: MonthCalendarItem; end: MonthCalendarItem } {
    return value !== null && "start" in value;
}
