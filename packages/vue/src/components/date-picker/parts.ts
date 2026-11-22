import { DatePickerPopup } from "./date-picker-popup.ts";
import { DatePickerPortal } from "./date-picker-portal.ts";
import { DatePickerPositioner } from "./date-picker-positioner.ts";
import { DatePickerRoot } from "./date-picker-root.ts";
import { DatePickerTrigger } from "./date-picker-trigger.ts";

/** spec/calendar.md: a trigger and a popup holding a bound Calendar */
export const DatePicker = {
    Root: DatePickerRoot,
    Trigger: DatePickerTrigger,
    Portal: DatePickerPortal,
    Positioner: DatePickerPositioner,
    Popup: DatePickerPopup,
};
