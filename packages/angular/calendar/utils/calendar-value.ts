import type { DateRange, PlainDate } from "@fragiola/primitives/date";

/** What a calendar holds: one date (Calendar) or a range (RangeCalendar). */
export type CalendarMode = "single" | "range";
export type CalendarValue = PlainDate | DateRange | null;

/** The component a calendar's parts belong to: their part attribute's prefix. */
export type CalendarComponent = "calendar" | "range-calendar";

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
