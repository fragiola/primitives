import { DatePickerPopup } from "../date-picker/date-picker-popup.tsx";
import { DatePickerPortal } from "../date-picker/date-picker-portal.tsx";
import { DatePickerPositioner } from "../date-picker/date-picker-positioner.tsx";
import { DatePickerTrigger } from "../date-picker/date-picker-trigger.tsx";
import { YearPickerRoot } from "./year-picker-root.tsx";

/** spec/month-calendar.md: one year, with the DatePicker's parts (named `year-picker-*`) */
export const YearPicker = {
    Root: YearPickerRoot,
    Trigger: DatePickerTrigger,
    Portal: DatePickerPortal,
    Positioner: DatePickerPositioner,
    Popup: DatePickerPopup,
};
