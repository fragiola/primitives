// The entry of @fragiola/primitives-angular/month-range-calendar: a range of months (spec/month-calendar.md). Its root is its own; its
// parts are the MonthCalendar's directives (`@fragiola/primitives-angular/month-calendar`),
// re-exported here.

export type {
    PlainYear,
    PlainYearMonth,
    YearMonthRange,
    YearRange,
} from "@fragiola/primitives/month-year";
export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export {
    MonthCalendarCell,
    type MonthCalendarCellState,
    MonthCalendarGrid,
    MonthCalendarGridBody,
    MonthCalendarHeading,
    type MonthCalendarItem,
    MonthCalendarNextButton,
    type MonthCalendarNextButtonState,
    MonthCalendarPrevButton,
    type MonthCalendarPrevButtonState,
    MonthCalendarRow,
} from "@fragiola/primitives-angular/month-calendar";
export { MonthRangeCalendarRoot } from "./directives/month-range-calendar-root.directive.ts";
