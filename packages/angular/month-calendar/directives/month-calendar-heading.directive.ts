import { computed, Directive, inject } from "@angular/core";
import { MONTH_CALENDAR } from "../utils/month-calendar-state.ts";

/**
 * The year (a month calendar) or the page of years shown:
 * `<h2 monthCalendarHeading #heading="monthCalendarHeading">{{ heading.label() }}</h2>` (from
 * `Intl`, unless the consumer writes its own content).
 */
@Directive({
    selector: "[monthCalendarHeading]",
    exportAs: "monthCalendarHeading",
    host: {
        "[attr.data-primitives-part]": "calendar.part('heading')",
        "[attr.id]": "calendar.headingId()",
        "aria-live": "polite",
    },
})
export class MonthCalendarHeading {
    protected readonly calendar = inject(MONTH_CALENDAR);
    /** The year or the page of years it names, from `Intl`. */
    readonly label = computed(() =>
        this.calendar
            .units()
            .heading(this.calendar.locale(), this.calendar.pageStart()),
    );
}
