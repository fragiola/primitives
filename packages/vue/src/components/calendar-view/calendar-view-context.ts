import type { InjectionKey } from "vue";

/** A calendar's view: its days, the months of a year, or a page of years. */
export type CalendarViewName = "day" | "month" | "year";

export interface CalendarViewContext {
    view: () => CalendarViewName;
    /** Shows another view (the Trigger's `trigger-press`, a choice's `item-press`). */
    change: (
        view: CalendarViewName,
        reason: "trigger-press" | "item-press",
    ) => void;
}

export const CalendarViewKey: InjectionKey<CalendarViewContext> =
    Symbol("CalendarView");
