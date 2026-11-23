import { InjectionToken, type Signal } from "@angular/core";

/** A calendar's view: its days, the months of a year, or a page of years. */
export type CalendarViewName = "day" | "month" | "year";

/** The enclosing `[calendarViewRoot]`, for its Trigger. */
export interface CalendarViewContext {
    view: Signal<CalendarViewName>;
    /** Shows another view (the Trigger's `trigger-press`, a choice's `item-press`). */
    change: (
        view: CalendarViewName,
        reason: "trigger-press" | "item-press",
    ) => void;
}

export const CALENDAR_VIEW = new InjectionToken<CalendarViewContext>(
    "CALENDAR_VIEW",
);
