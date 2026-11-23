import { DatePickerPopup } from "../date-picker/date-picker-popup.ts";
import { DatePickerPortal } from "../date-picker/date-picker-portal.ts";
import { DatePickerPositioner } from "../date-picker/date-picker-positioner.ts";
import { DatePickerTrigger } from "../date-picker/date-picker-trigger.ts";
import { MonthPickerRoot } from "./month-picker-root.ts";

/** spec/month-calendar.md: one month, with the DatePicker's parts (named `month-picker-*`) */
export const MonthPicker = {
    Root: MonthPickerRoot,
    Trigger: DatePickerTrigger,
    Portal: DatePickerPortal,
    Positioner: DatePickerPositioner,
    Popup: DatePickerPopup,
};
