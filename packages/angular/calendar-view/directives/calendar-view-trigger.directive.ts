import { computed, Directive, inject } from "@angular/core";
import { CALENDAR } from "@fragiola/primitives-angular/calendar";
import { dataValues, injectFlush } from "@fragiola/primitives-angular/internal";
import {
    CALENDAR_VIEW,
    type CalendarViewName,
} from "../utils/calendar-view-context.ts";

export interface CalendarViewTriggerState {
    view: CalendarViewName;
    /** In the year view: there is no view above. */
    disabled: boolean;
}

/**
 * Goes one view up: days → months → years (spec/month-calendar.md, "Views"):
 * `<button calendarViewTrigger>`. Its content is the consumer's (typically the view's Heading);
 * the new view's focused cell takes the focus.
 */
@Directive({
    selector: "[calendarViewTrigger]",
    exportAs: "calendarViewTrigger",
    host: {
        type: "button",
        "[attr.data-primitives-part]": "calendar.part('view-trigger')",
        "[attr.disabled]": "data().disabled",
        "[attr.data-view]": "data().view",
        "[attr.data-disabled]": "data().disabled",
        "(click)": "onClick()",
    },
})
export class CalendarViewTrigger {
    protected readonly calendar = inject(CALENDAR);
    private readonly views = inject(CALENDAR_VIEW);
    private readonly flush = injectFlush();
    readonly state = computed<CalendarViewTriggerState>(() => {
        const view = this.views.view();
        return { view, disabled: view === "year" };
    });
    protected readonly data = computed(() => dataValues(this.state()));

    protected onClick(): void {
        const { view, disabled } = this.state();
        if (!disabled) {
            this.views.change(
                view === "day" ? "month" : "year",
                "trigger-press",
            );
            this.flush();
        }
    }
}
