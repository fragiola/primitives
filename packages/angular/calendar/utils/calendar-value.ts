import type { CalendarSystem } from "@fragiola/primitives/calendar-systems";
import {
    addMonths,
    calendarKeyTarget,
    type DateRange,
    endOfMonth,
    formatFullDate,
    isSameMonth,
    monthGrid,
    monthsBetween,
    type PlainDate,
    startOfMonth,
} from "@fragiola/primitives/date";

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
    /**
     * A calendar system from `@fragiola/primitives/calendar-systems` (spec/calendar-systems.md):
     * the grid shows its months; values stay ISO. Default: the ISO calendar.
     */
    calendar?: CalendarSystem;
}

/** The month math a calendar runs on: a calendar system's, or the ISO calendar's (`/date`). */
export type CalendarMath = Pick<
    CalendarSystem,
    | "addMonths"
    | "startOfMonth"
    | "endOfMonth"
    | "monthsBetween"
    | "isSameMonth"
    | "monthGrid"
    | "keyTarget"
    | "fullDate"
>;

/** The ISO calendar's month math, when no system is given. */
export const ISO_MATH: CalendarMath = {
    addMonths,
    startOfMonth,
    endOfMonth,
    monthsBetween,
    isSameMonth,
    monthGrid: (date, firstDay) => monthGrid(date.year, date.month, firstDay),
    keyTarget: calendarKeyTarget,
    fullDate: formatFullDate,
};

export function isRange(value: CalendarValue): value is DateRange {
    return value !== null && "start" in value;
}
