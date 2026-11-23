import type { CalendarSystem } from "@fragiola/primitives/calendar-systems";
import type { DateRange, PlainDate } from "@fragiola/primitives/date";
import type { InjectionKey, Ref } from "vue";
import type { CalendarMath, CalendarMode } from "./calendar-value.ts";

/** The component a calendar's parts belong to: their part attribute's prefix. */
export type CalendarComponent =
    | "calendar"
    | "range-calendar"
    // a Root of its own entry over the Calendar's parts (Epic #79): the type only, no code here
    | "multiple-calendar";

export interface CalendarCellState {
    today: boolean;
    selected: boolean;
    disabled: boolean;
    unavailable: boolean;
    outsideMonth: boolean;
    focused: boolean;
    rangeStart: boolean;
    rangeEnd: boolean;
    inRange: boolean;
    rangePreview: boolean;
}

export interface CalendarContext {
    component: CalendarComponent;
    mode: CalendarMode;
    /** The locale `Intl` writes the names in (with a calendar system's `-u-ca-`). */
    locale: () => string;
    /** The month math: the calendar system's, or the ISO calendar's. */
    math: () => CalendarMath;
    /** The calendar system, when one is given (a CalendarView's month and year views use it). */
    calendar: () => CalendarSystem | undefined;
    firstDay: () => number;
    visibleMonths: () => number;
    /** The first visible month (day 1). */
    visibleStart: Ref<PlainDate>;
    focusedDate: Ref<PlainDate>;
    disabled: () => boolean;
    readOnly: () => boolean;
    headingId: (offset: number) => string;
    gridId: (offset: number) => string;
    cellState: (date: PlainDate, month: PlainDate) => CalendarCellState;
    /** Moves the focused date (and the visible months); `false` when it is out of bounds. */
    moveFocus: (date: PlainDate) => boolean;
    page: (delta: 1 | -1) => void;
    canPage: (delta: 1 | -1) => boolean;
    select: (date: PlainDate) => void;
    /** RangeCalendar: the start of a range being chosen. */
    anchor: Ref<PlainDate | null>;
    cancelRange: () => void;
    setHovered: (date: PlainDate | null) => void;
    cells: Map<string, HTMLElement>;
    rangeValue: () => DateRange | null;
    /** Asks for the focused date's cell to take focus once it is rendered. */
    requestFocus: () => void;
    /** Whether a focus is pending (a cell that mounts as the focused date takes it). */
    focusPending: { current: boolean };
}

export const CalendarKey: InjectionKey<CalendarContext> = Symbol("Calendar");

/** The month a grid shows (`offset` months after the first visible one). */
export const CalendarGridKey: InjectionKey<Ref<PlainDate>> =
    Symbol("CalendarGrid");
