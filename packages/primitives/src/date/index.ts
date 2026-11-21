// The entry of @fragiola/primitives/date: the plain date (`{ year, month, day }`, no time zone), its math, the month grid, the calendar key map and the locale data from `Intl`.

export {
    type CalendarKeyOptions,
    calendarKeyTarget,
} from "./calendar-keys.ts";
export {
    addDays,
    addMonths,
    addYears,
    clampDate,
    dayOfWeek,
    daysInMonth,
    endOfMonth,
    endOfWeek,
    isBetween,
    isWithinBounds,
    monthsBetween,
    startOfMonth,
    startOfWeek,
} from "./date-math.ts";
export {
    firstDayOfWeek,
    formatDayNumber,
    formatFullDate,
    formatMonthYear,
    type Weekday,
    weekdays,
} from "./locale-data.ts";
export { monthGrid } from "./month-grid.ts";
export {
    compareDates,
    type DateRange,
    fromIsoDate,
    isSameDate,
    isSameMonth,
    type PlainDate,
    plainDate,
    today,
    toIsoDate,
    toLocalDate,
} from "./plain-date.ts";
