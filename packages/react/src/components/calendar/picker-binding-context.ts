import { createContext } from "react";
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
    /** Whether the picker's popup is open (a closing picker's calendar takes no focus). */
    open: boolean;
    value: CalendarValue;
    /** Sets the picker's value and closes its popup (reason `item-press`). */
    choose: (value: CalendarValue) => void;
    options: CalendarOptions;
    /** The picker is read-only: its calendar is too (it can be browsed, no date chosen). */
    readOnly: boolean;
}

export const PickerBindingContext = createContext<PickerBinding | null>(null);
