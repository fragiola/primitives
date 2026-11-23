import { computed, Directive, inject } from "@angular/core";
import {
    formatYear,
    formatYearSpan,
    UNIT_PAGE_SIZE,
} from "@fragiola/primitives/month-year";
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
    readonly label = computed(() => {
        const calendar = this.calendar;
        const start = calendar.pageStart();
        return calendar.kind === "month"
            ? formatYear(calendar.locale(), start / UNIT_PAGE_SIZE)
            : formatYearSpan(
                  calendar.locale(),
                  start,
                  start + UNIT_PAGE_SIZE - 1,
              );
    });
}
