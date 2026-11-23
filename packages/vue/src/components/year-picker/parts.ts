import { DatePickerPopup } from "../date-picker/date-picker-popup.ts";
import { DatePickerPortal } from "../date-picker/date-picker-portal.ts";
import { DatePickerPositioner } from "../date-picker/date-picker-positioner.ts";
import { DatePickerTrigger } from "../date-picker/date-picker-trigger.ts";
import { YearPickerRoot } from "./year-picker-root.ts";

/** spec/month-calendar.md: one year, with the DatePicker's parts (named `year-picker-*`) */
export const YearPicker = {
    Root: YearPickerRoot,
    Trigger: DatePickerTrigger,
    Portal: DatePickerPortal,
    Positioner: DatePickerPositioner,
    Popup: DatePickerPopup,
};
