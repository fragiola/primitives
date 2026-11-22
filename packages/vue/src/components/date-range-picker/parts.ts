import { DatePickerPopup } from "../date-picker/date-picker-popup.ts";
import { DatePickerPortal } from "../date-picker/date-picker-portal.ts";
import { DatePickerPositioner } from "../date-picker/date-picker-positioner.ts";
import { DatePickerTrigger } from "../date-picker/date-picker-trigger.ts";
import { DateRangePickerRoot } from "./date-range-picker-root.ts";

/** spec/calendar.md: a trigger and a popup holding a bound RangeCalendar, with the DatePicker's parts */
export const DateRangePicker = {
    Root: DateRangePickerRoot,
    Trigger: DatePickerTrigger,
    Portal: DatePickerPortal,
    Positioner: DatePickerPositioner,
    Popup: DatePickerPopup,
};
