import { createContext } from "react";

/** A calendar's view: its days, the months of a year, or a page of years. */
export type CalendarViewName = "day" | "month" | "year";

export interface CalendarViewContextValue {
    view: CalendarViewName;
    /** Shows another view (the Trigger's `trigger-press`, a choice's `item-press`). */
    change: (
        view: CalendarViewName,
        reason: "trigger-press" | "item-press",
    ) => void;
}

export const CalendarViewContext =
    createContext<CalendarViewContextValue | null>(null);
