// The entry of @fragiola/primitives-angular/month-picker: a trigger and a non-modal popup holding a
// bound MonthCalendar (one month; spec/month-calendar.md). Its root is its own, and the lower layer every month and year picker builds on; its parts are the
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
export { MonthPickerRoot } from "./directives/month-picker-root.directive.ts";
export { MonthPickerRootBase } from "./directives/month-picker-root-base.ts";
export {
    createMonthPicker,
    type MonthPickerInputs,
    type MonthPickerState,
} from "./utils/month-picker-state.ts";
