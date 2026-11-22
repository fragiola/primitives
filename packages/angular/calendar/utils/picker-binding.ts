import { InjectionToken, type Signal } from "@angular/core";
import type {
    CalendarMode,
    CalendarOptions,
    CalendarValue,
} from "./calendar-value.ts";

/**
 * What a DatePicker or DateRangePicker gives the calendar inside its popup: a calendar with no
 * value of its own binds to it (spec/calendar.md, "Anatomy"). It lives with the calendar, so a
 * Calendar alone never imports a picker's code; the pickers provide it.
 */
export interface PickerBinding {
    mode: CalendarMode;
    value: Signal<CalendarValue>;
    options: Signal<CalendarOptions>;
    /** Whether the picker's popup is open (a closing picker's calendar takes no focus). */
    open: Signal<boolean>;
    /** A read-only picker: its calendar can be browsed, no date can be chosen. */
    readOnly: Signal<boolean>;
    /** Sets the picker's value and closes its popup (reason `item-press`). */
    choose: (value: CalendarValue) => void;
}

export const PICKER_BINDING = new InjectionToken<PickerBinding>(
    "PICKER_BINDING",
);
