import type { DateRange, PlainDate } from "@fragiola/primitives/date";

/** What a calendar holds: one date (Calendar) or a range (RangeCalendar). */
export type CalendarMode = "single" | "range";
export type CalendarValue = PlainDate | DateRange | null;

/** The component a calendar's parts belong to: their part attribute's prefix. */
export type CalendarComponent =
    | "calendar"
    | "range-calendar"
    // a Root of its own entry over the Calendar's parts (Epic #79): the type only, no code here
    | "multiple-calendar";

/** The options a calendar takes, and a picker passes to the calendar it binds (spec/calendar.md). */
export interface CalendarOptions {
    min?: PlainDate | null;
    max?: PlainDate | null;
    isDateUnavailable?: (date: PlainDate) => boolean;
    locale?: string;
    firstDayOfWeek?: number;
    visibleMonths?: number;
}

export function isRange(value: CalendarValue): value is DateRange {
    return value !== null && "start" in value;
}
