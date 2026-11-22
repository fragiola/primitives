// The entry of @fragiola/primitives-angular/range-calendar: the month grid for choosing a start and
// an end date (spec/calendar.md). Its root is its own; its parts are the Calendar's directives
// (`@fragiola/primitives-angular/calendar`), re-exported here.

export type {
    DateRange,
    PlainDate,
    Weekday,
} from "@fragiola/primitives/date";
export {
    CalendarCell,
    type CalendarCellState,
    CalendarGrid,
    CalendarGridBody,
    CalendarGridHeader,
    CalendarHeaderCell,
    CalendarHeading,
    CalendarNextButton,
    type CalendarNextButtonState,
    type CalendarOptions,
    CalendarPrevButton,
    type CalendarPrevButtonState,
    CalendarRow,
    injectCalendar,
} from "@fragiola/primitives-angular/calendar";
export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { RangeCalendarRoot } from "./directives/range-calendar-root.directive.ts";
