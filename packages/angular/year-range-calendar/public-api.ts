// The entry of @fragiola/primitives-angular/year-range-calendar: a range of years (spec/month-calendar.md). Its root is its own; its
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
export { YearRangeCalendarRoot } from "./directives/year-range-calendar-root.directive.ts";
