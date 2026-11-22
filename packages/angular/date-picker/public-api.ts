// The entry of @fragiola/primitives-angular/date-picker: a trigger and a non-modal popup holding a
// bound Calendar (spec/calendar.md; the `[calendarRoot]` comes from `/calendar`), as standalone
// attribute directives on the consumer's own elements. Its parts serve the DateRangePicker too
// (`/date-range-picker`).

export type { PlainDate } from "@fragiola/primitives/date";
export type { Align, Side } from "@fragiola/primitives/positioning";
export type {
    CalendarOptions,
    CalendarValue,
} from "@fragiola/primitives-angular/calendar";
export type {
    ChangeDetails,
    ChangeReason,
    OpenChangeDetails,
    OpenChangeEvent,
    OverlayActions,
    OverlayPortalOptions,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export {
    DatePickerPopup,
    type DatePickerPopupState,
} from "./directives/date-picker-popup.directive.ts";
export { DatePickerPortal } from "./directives/date-picker-portal.directive.ts";
export {
    DatePickerPositioner,
    type DatePickerPositionerState,
} from "./directives/date-picker-positioner.directive.ts";
export { DatePickerRoot } from "./directives/date-picker-root.directive.ts";
export { DatePickerRootBase } from "./directives/date-picker-root-base.ts";
export {
    DatePickerTrigger,
    type DatePickerTriggerState,
} from "./directives/date-picker-trigger.directive.ts";
export { injectDatePicker } from "./inject/inject-date-picker.ts";
export {
    createDatePicker,
    DATE_PICKER,
    type DatePickerComponent,
    type DatePickerInputs,
    type DatePickerState,
    type DatePickerTriggerData,
} from "./utils/date-picker-state.ts";
