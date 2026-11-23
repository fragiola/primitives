// The entry of @fragiola/primitives-angular/month-calendar: a grid of the 12 months of a year for
// choosing one month (spec/month-calendar.md, the APG grid with the calendar's keys), as
// standalone attribute directives on the consumer's own elements. Its parts and state serve the
// range and year calendars too (`/month-range-calendar`, `/year-calendar`,
// `/year-range-calendar`), and its binding is the lower layer the month and year pickers and the
// calendar's views provide; its month math and locale data are the toolkit's `/month-year`.

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
export { MonthCalendarCell } from "./directives/month-calendar-cell.directive.ts";
export { MonthCalendarGrid } from "./directives/month-calendar-grid.directive.ts";
export { MonthCalendarGridBody } from "./directives/month-calendar-grid-body.directive.ts";
export { MonthCalendarHeading } from "./directives/month-calendar-heading.directive.ts";
export {
    MonthCalendarNextButton,
    type MonthCalendarNextButtonState,
} from "./directives/month-calendar-next-button.directive.ts";
export {
    MonthCalendarPrevButton,
    type MonthCalendarPrevButtonState,
} from "./directives/month-calendar-prev-button.directive.ts";
export { MonthCalendarRoot } from "./directives/month-calendar-root.directive.ts";
export { MonthCalendarRootBase } from "./directives/month-calendar-root-base.ts";
export { MonthCalendarRow } from "./directives/month-calendar-row.directive.ts";
export {
    MONTH_CALENDAR_BINDING,
    type MonthCalendarBinding,
} from "./utils/month-calendar-binding.ts";
export {
    MONTH_CALENDAR,
    type MonthCalendarCellState,
    type MonthCalendarInputs,
    MonthCalendarState,
} from "./utils/month-calendar-state.ts";
export {
    isItemRange,
    itemIndex,
    itemOf,
    type MonthCalendarComponent,
    type MonthCalendarItem,
    type MonthCalendarKind,
    type MonthCalendarMode,
    type MonthCalendarOptions,
    type MonthCalendarValue,
} from "./utils/month-calendar-value.ts";
