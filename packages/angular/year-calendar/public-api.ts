// The entry of @fragiola/primitives-angular/year-calendar: one year, in a grid of a page of 12 years (spec/month-calendar.md). Its root is its own; its
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
export { YearCalendarRoot } from "./directives/year-calendar-root.directive.ts";
