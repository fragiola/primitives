import { DatePickerPopup } from "../date-picker/date-picker-popup.ts";
import { DatePickerPortal } from "../date-picker/date-picker-portal.ts";
import { DatePickerPositioner } from "../date-picker/date-picker-positioner.ts";
import { DatePickerTrigger } from "../date-picker/date-picker-trigger.ts";
import { MonthRangePickerRoot } from "./month-range-picker-root.ts";

/** spec/month-calendar.md: a range of months, with the DatePicker's parts (named `month-range-picker-*`) */
export const MonthRangePicker = {
    Root: MonthRangePickerRoot,
    Trigger: DatePickerTrigger,
    Portal: DatePickerPortal,
    Positioner: DatePickerPositioner,
    Popup: DatePickerPopup,
};
