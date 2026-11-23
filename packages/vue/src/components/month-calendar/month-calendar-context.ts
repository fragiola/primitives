import type { InjectionKey, Ref } from "vue";
import type {
    MonthCalendarItem,
    MonthCalendarKind,
    MonthCalendarMode,
} from "./month-calendar-value.ts";

/** The component a month or year calendar's parts belong to: their part attribute's prefix. */
export type MonthCalendarComponent =
    | "month-calendar"
    | "month-range-calendar"
    | "year-calendar"
    | "year-range-calendar";

export interface MonthCalendarCellState {
    today: boolean;
    selected: boolean;
    disabled: boolean;
    unavailable: boolean;
    focused: boolean;
    rangeStart: boolean;
    rangeEnd: boolean;
    inRange: boolean;
    rangePreview: boolean;
}

export interface MonthCalendarContext {
    component: MonthCalendarComponent;
    kind: MonthCalendarKind;
    mode: MonthCalendarMode;
    locale: () => string;
    columns: () => number;
    /** The first item of the page shown. */
    pageStart: Ref<number>;
    /** The focused item. */
    focused: Ref<number>;
    disabled: () => boolean;
    readOnly: () => boolean;
    headingId: string;
    gridId: string;
    itemOf: (index: number) => MonthCalendarItem;
    cellState: (index: number) => MonthCalendarCellState;
    /** Moves the focused item (and the page); `false` when it is disabled. */
    moveFocus: (index: number) => boolean;
    page: (delta: 1 | -1) => void;
    canPage: (delta: 1 | -1) => boolean;
    select: (index: number) => void;
    /** A range calendar: the start of a range being chosen. */
    anchor: Ref<number | null>;
    cancelRange: () => void;
    setHovered: (index: number | null) => void;
    cells: Map<number, HTMLElement>;
    /** Asks for the focused item's cell to take focus once it is rendered. */
    requestFocus: () => void;
    focusPending: { current: boolean };
}

export const MonthCalendarKey: InjectionKey<MonthCalendarContext> =
    Symbol("MonthCalendar");
