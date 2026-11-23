// The entry of @fragiola/primitives-angular/multiple-calendar: the month grid for choosing several
// dates (spec/calendar.md, "Multiple dates"). Its root is its own, its state the Calendar's
// (`CalendarState`) with the dates on top; its parts are the Calendar's directives
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
export { MultipleCalendarRoot } from "./directives/multiple-calendar-root.directive.ts";
export {
    type MultipleCalendarDates,
    MultipleCalendarState,
} from "./utils/multiple-calendar-state.ts";
