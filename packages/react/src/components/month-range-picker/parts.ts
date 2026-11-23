import { DatePickerPopup } from "../date-picker/date-picker-popup.tsx";
import { DatePickerPortal } from "../date-picker/date-picker-portal.tsx";
import { DatePickerPositioner } from "../date-picker/date-picker-positioner.tsx";
import { DatePickerTrigger } from "../date-picker/date-picker-trigger.tsx";
import { MonthRangePickerRoot } from "./month-range-picker-root.tsx";

/** spec/month-calendar.md: a range of months, with the DatePicker's parts (named `month-range-picker-*`) */
export const MonthRangePicker = {
    Root: MonthRangePickerRoot,
    Trigger: DatePickerTrigger,
    Portal: DatePickerPortal,
    Positioner: DatePickerPositioner,
    Popup: DatePickerPopup,
};
