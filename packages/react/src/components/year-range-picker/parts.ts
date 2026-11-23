import { DatePickerPopup } from "../date-picker/date-picker-popup.tsx";
import { DatePickerPortal } from "../date-picker/date-picker-portal.tsx";
import { DatePickerPositioner } from "../date-picker/date-picker-positioner.tsx";
import { DatePickerTrigger } from "../date-picker/date-picker-trigger.tsx";
import { YearRangePickerRoot } from "./year-range-picker-root.tsx";

/** spec/month-calendar.md: a range of years, with the DatePicker's parts (named `year-range-picker-*`) */
export const YearRangePicker = {
    Root: YearRangePickerRoot,
    Trigger: DatePickerTrigger,
    Portal: DatePickerPortal,
    Positioner: DatePickerPositioner,
    Popup: DatePickerPopup,
};
