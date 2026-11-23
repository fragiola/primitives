// The entry of @fragiola/primitives-angular/month-range-picker: a trigger and a non-modal popup holding a
// bound MonthRangeCalendar (a range of months; spec/month-calendar.md). Its root is its own; its parts are the
// DatePicker's directives (`@fragiola/primitives-angular/date-picker`), re-exported here.

export type {
    PlainYear,
    PlainYearMonth,
    YearMonthRange,
    YearRange,
} from "@fragiola/primitives/month-year";
export {
    DatePickerPopup,
    type DatePickerPopupState,
    DatePickerPortal,
    DatePickerPositioner,
    type DatePickerPositionerState,
    DatePickerTrigger,
    type DatePickerTriggerState,
} from "@fragiola/primitives-angular/date-picker";
export type {
    ChangeDetails,
    ChangeReason,
    OpenChangeDetails,
    OpenChangeEvent,
    OverlayActions,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { MonthRangePickerRoot } from "./directives/month-range-picker-root.directive.ts";
