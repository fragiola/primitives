import { DatePickerPopup } from "./date-picker-popup.tsx";
import { DatePickerPortal } from "./date-picker-portal.tsx";
import { DatePickerPositioner } from "./date-picker-positioner.tsx";
import { DatePickerRoot } from "./date-picker-root.tsx";
import { DatePickerTrigger } from "./date-picker-trigger.tsx";

/** spec/calendar.md: a trigger and a popup holding a bound Calendar */
export const DatePicker = {
    Root: DatePickerRoot,
    Trigger: DatePickerTrigger,
    Portal: DatePickerPortal,
    Positioner: DatePickerPositioner,
    Popup: DatePickerPopup,
};
