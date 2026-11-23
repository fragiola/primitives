// The entry of @fragiola/primitives/date: the plain date (`{ year, month, day }`, no time zone), its math, the month grid, the calendar key map, the locale data from `Intl` and the document language's watch.

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
export { watchDocumentLanguage } from "./watch-document-language.ts";
