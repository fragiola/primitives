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
