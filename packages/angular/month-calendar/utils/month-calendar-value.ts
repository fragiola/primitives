import type {
    CalendarSystem,
    CalendarUnits,
} from "@fragiola/primitives/calendar-systems";
import {
    currentYearMonth,
    formatMonthName,
    formatYear,
    formatYearMonth,
    formatYearSpan,
    fromMonthIndex,
    monthIndex,
    type PlainYear,
    type PlainYearMonth,
    UNIT_PAGE_SIZE,
    unitKeyTarget,
    unitPageStart,
    unitRows,
} from "@fragiola/primitives/month-year";

/** What a month or year calendar's items are: months, or years (spec/month-calendar.md). */
export type MonthCalendarKind = "month" | "year";
/** One item, or a range of them. */
export type MonthCalendarMode = "single" | "range";

/** The component a month or year calendar's parts belong to: their part attribute's prefix. */
export type MonthCalendarComponent =
    | "month-calendar"
    | "month-range-calendar"
    | "year-calendar"
    | "year-range-calendar";

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
    isUnavailable?: (item: MonthCalendarItem) => boolean;
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
    | "page"
    | "rows"
    | "keyTarget"
    | "text"
    | "name"
    | "heading"
    | "today"
>;

/**
 * The units of a kind: the calendar system's (its hook), else the ISO calendar's months or years
 * (`/month-year`, pages of 12).
 */
export function unitsOf(
    kind: MonthCalendarKind,
    calendar: CalendarSystem | undefined,
): MonthCalendarUnits {
    if (calendar) {
        return calendar.units(kind);
    }
    const month = kind === "month";
    return {
        index: (item) =>
            month ? monthIndex(item as PlainYearMonth) : item.year,
        item: (index) => (month ? fromMonthIndex(index) : { year: index }),
        pageStart: unitPageStart,
        pageSize: () => UNIT_PAGE_SIZE,
        page: (start, delta) => start + delta * UNIT_PAGE_SIZE,
        rows: unitRows,
        keyTarget: unitKeyTarget,
        text: (locale, index) =>
            month
                ? formatMonthName(locale, fromMonthIndex(index), "long")
                : formatYear(locale, index),
        name: (locale, index) =>
            month
                ? formatYearMonth(locale, fromMonthIndex(index))
                : formatYear(locale, index),
        heading: (locale, start) =>
            month
                ? formatYear(locale, start / UNIT_PAGE_SIZE)
                : formatYearSpan(locale, start, start + UNIT_PAGE_SIZE - 1),
        today: () => {
            const now = currentYearMonth();
            return month ? monthIndex(now) : now.year;
        },
    };
}

export function isItemRange(
    value: MonthCalendarValue,
): value is { start: MonthCalendarItem; end: MonthCalendarItem } {
    return value !== null && "start" in value;
}
