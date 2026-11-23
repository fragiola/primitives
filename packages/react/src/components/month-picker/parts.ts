import { DatePickerPopup } from "../date-picker/date-picker-popup.tsx";
import { DatePickerPortal } from "../date-picker/date-picker-portal.tsx";
import { DatePickerPositioner } from "../date-picker/date-picker-positioner.tsx";
import { DatePickerTrigger } from "../date-picker/date-picker-trigger.tsx";
import { MonthPickerRoot } from "./month-picker-root.tsx";

/** spec/month-calendar.md: one month, with the DatePicker's parts (named `month-picker-*`) */
export const MonthPicker = {
    Root: MonthPickerRoot,
    Trigger: DatePickerTrigger,
    Portal: DatePickerPortal,
    Positioner: DatePickerPositioner,
    Popup: DatePickerPopup,
};
