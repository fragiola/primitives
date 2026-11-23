import { DatePickerPopup } from "../date-picker/date-picker-popup.ts";
import { DatePickerPortal } from "../date-picker/date-picker-portal.ts";
import { DatePickerPositioner } from "../date-picker/date-picker-positioner.ts";
import { DatePickerTrigger } from "../date-picker/date-picker-trigger.ts";
import { YearRangePickerRoot } from "./year-range-picker-root.ts";

/** spec/month-calendar.md: a range of years, with the DatePicker's parts (named `year-range-picker-*`) */
export const YearRangePicker = {
    Root: YearRangePickerRoot,
    Trigger: DatePickerTrigger,
    Portal: DatePickerPortal,
    Positioner: DatePickerPositioner,
    Popup: DatePickerPopup,
};
