import { CalendarRoot } from "@fragiola/primitives-angular/calendar";
import {
    DateFieldInput,
    DateFieldSegment,
    DatePickerInputRoot,
    DatePickerPopup,
    DatePickerPortal,
    DatePickerPositioner,
    DatePickerTrigger,
} from "@fragiola/primitives-angular/date-picker-input";
import { DateRangeFieldInput } from "@fragiola/primitives-angular/date-range-field";
import { DateRangePickerInputRoot } from "@fragiola/primitives-angular/date-range-picker-input";
import { RangeCalendarRoot } from "@fragiola/primitives-angular/range-calendar";
import { MonthView } from "../../kit/month-view.ts";

/** Every typed picker directive, with the calendars, for a scenario's `imports`. */
export const TYPED_PICKER_PARTS = [
    DatePickerInputRoot,
    DateRangePickerInputRoot,
    DateFieldInput,
    DateRangeFieldInput,
    DateFieldSegment,
    DatePickerTrigger,
    DatePickerPortal,
    DatePickerPositioner,
    DatePickerPopup,
    CalendarRoot,
    RangeCalendarRoot,
    MonthView,
] as const;
