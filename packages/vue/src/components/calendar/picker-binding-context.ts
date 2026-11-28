import type { ComputedRef, InjectionKey } from "vue";
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
    open: () => boolean;
    /**
     * Whether the popup is a layer of the overlay tree (its overlay session is open). Its calendar
     * takes the focus only then, so an enclosing overlay (a Dialog's focus trap, a Popover's focus
     * watch) sees the focus move into its own child layer (spec/calendar.md, "Focus").
     */
    layered: () => boolean;
    value: ComputedRef<CalendarValue>;
    /** Sets the picker's value and closes its popup (reason `item-press`). */
    choose: (value: CalendarValue) => void;
    options: () => CalendarOptions;
    /** A read-only picker's calendar is read-only: it can be browsed, no date chosen. */
    readOnly?: () => boolean;
}

export const PickerBindingKey: InjectionKey<PickerBinding> =
    Symbol("PickerBinding");
