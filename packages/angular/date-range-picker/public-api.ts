// The entry of @fragiola/primitives-angular/date-range-picker: a trigger and a non-modal popup
// holding a bound RangeCalendar (spec/calendar.md; the `[rangeCalendarRoot]` comes from
// `/range-calendar`). Its root is its own; its parts are the DatePicker's directives
// (`@fragiola/primitives-angular/date-picker`), re-exported here.

export type { DateRange, PlainDate } from "@fragiola/primitives/date";
export type { Align, Side } from "@fragiola/primitives/positioning";
export type { CalendarOptions } from "@fragiola/primitives-angular/calendar";
export {
    DatePickerPopup,
    type DatePickerPopupState,
    DatePickerPortal,
    DatePickerPositioner,
    type DatePickerPositionerState,
    DatePickerTrigger,
    type DatePickerTriggerState,
    injectDatePicker,
} from "@fragiola/primitives-angular/date-picker";
export type {
    ChangeDetails,
    ChangeReason,
    OpenChangeEvent,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { DateRangePickerRoot } from "./directives/date-range-picker-root.directive.ts";
