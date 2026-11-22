// The entry of @fragiola/primitives-angular/calendar: a month grid for choosing one date
// (spec/calendar.md, the APG grid of the date picker dialog example), as standalone attribute
// directives on the consumer's own elements. Its parts serve the RangeCalendar too
// (`/range-calendar`), and its state and picker binding are the lower layer the range calendar and
// the pickers build on. Its date math and locale data are the toolkit's `/date`.

export type {
    DateRange,
    PlainDate,
    Weekday,
} from "@fragiola/primitives/date";
export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { CalendarCell } from "./directives/calendar-cell.directive.ts";
export { CalendarGrid } from "./directives/calendar-grid.directive.ts";
export { CalendarGridBody } from "./directives/calendar-grid-body.directive.ts";
export { CalendarGridHeader } from "./directives/calendar-grid-header.directive.ts";
export { CalendarHeaderCell } from "./directives/calendar-header-cell.directive.ts";
export { CalendarHeading } from "./directives/calendar-heading.directive.ts";
export {
    CalendarNextButton,
    type CalendarNextButtonState,
} from "./directives/calendar-next-button.directive.ts";
export {
    CalendarPrevButton,
    type CalendarPrevButtonState,
} from "./directives/calendar-prev-button.directive.ts";
export { CalendarRoot } from "./directives/calendar-root.directive.ts";
export { CalendarRootBase } from "./directives/calendar-root-base.ts";
export { CalendarRow } from "./directives/calendar-row.directive.ts";
export { injectCalendar } from "./inject/inject-calendar.ts";
export {
    CALENDAR,
    type CalendarCellState,
    type CalendarInputs,
    CalendarState,
} from "./utils/calendar-state.ts";
export type {
    CalendarComponent,
    CalendarMode,
    CalendarOptions,
    CalendarValue,
} from "./utils/calendar-value.ts";
export { PICKER_BINDING, type PickerBinding } from "./utils/picker-binding.ts";
