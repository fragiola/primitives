import type { DateRange, PlainDate } from "@fragiola/primitives/date";

/** What a calendar holds: one date (Calendar) or a range (RangeCalendar). */
export type CalendarMode = "single" | "range";
export type CalendarValue = PlainDate | DateRange | null;

/** The options a calendar takes, and a picker passes to the calendar it binds (spec/calendar.md). */
export interface CalendarOptions {
    /** Dates before it are disabled. */
    min?: PlainDate | null;
    /** Dates after it are disabled. */
    max?: PlainDate | null;
    /** Unavailable dates can be focused but not chosen. */
    isDateUnavailable?: (date: PlainDate) => boolean;
    /** A BCP 47 tag (default: the document's `lang`, then the browser's). */
    locale?: string;
    /** `0`–`6`, Sunday = 0 (default: the locale's). */
    firstDayOfWeek?: number;
    /** How many months are shown side by side (default 1). */
    visibleMonths?: number;
}

export function isRange(value: CalendarValue): value is DateRange {
    return value !== null && "start" in value;
}
