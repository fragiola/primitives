import { DatePickerPopup } from "../date-picker/date-picker-popup.tsx";
import { DatePickerPortal } from "../date-picker/date-picker-portal.tsx";
import { DatePickerPositioner } from "../date-picker/date-picker-positioner.tsx";
import { DatePickerTrigger } from "../date-picker/date-picker-trigger.tsx";
import { DateRangePickerRoot } from "./date-range-picker-root.tsx";

/** spec/calendar.md: a trigger and a popup holding a bound RangeCalendar, with the DatePicker's parts */
export const DateRangePicker = {
    Root: DateRangePickerRoot,
    Trigger: DatePickerTrigger,
    Portal: DatePickerPortal,
    Positioner: DatePickerPositioner,
    Popup: DatePickerPopup,
};
