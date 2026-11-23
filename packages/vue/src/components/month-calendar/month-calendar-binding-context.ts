import type { InjectionKey } from "vue";
import type {
    MonthCalendarKind,
    MonthCalendarMode,
    MonthCalendarOptions,
    MonthCalendarValue,
} from "./month-calendar-value.ts";

/**
 * What a month or year picker, or a calendar's month or year view, gives the month or year calendar
 * inside it: a calendar of its kind and mode with no value of its own binds to it
 * (spec/month-calendar.md). It lives with the calendar, so a calendar alone never imports a
 * picker's or a view's code. Its fields are read when used (a view's kind follows its view).
 */
export interface MonthCalendarBinding {
    readonly kind: MonthCalendarKind;
    readonly mode: MonthCalendarMode;
    /** Whether its picker's popup is open (a closing picker's calendar takes no focus). */
    open: () => boolean;
    /** Whether the calendar takes the focus when it mounts (a picker opening, a view switched). */
    focusOnMount: () => boolean;
    value: () => MonthCalendarValue;
    /** Sets the value (a picker: and closes; a view: navigates). */
    choose: (value: MonthCalendarValue) => void;
    options: () => MonthCalendarOptions;
    readOnly: () => boolean;
    /** A view: the item to focus first (the calendar's focused date's month or year). */
    focus?: () => number;
    /** A view: the items whose every day is disabled. */
    isDisabled?: (index: number) => boolean;
    /** A view: the items holding a chosen day. */
    isSelected?: (index: number) => boolean;
}

export const MonthCalendarBindingKey: InjectionKey<MonthCalendarBinding> =
    Symbol("MonthCalendarBinding");
