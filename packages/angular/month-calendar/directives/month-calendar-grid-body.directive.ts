import { computed, Directive, inject } from "@angular/core";
import { MONTH_CALENDAR } from "../utils/month-calendar-state.ts";
import type { MonthCalendarItem } from "../utils/month-calendar-value.ts";

/**
 * The rows of the page: `<tbody monthCalendarGridBody #body="monthCalendarGridBody">`; the consumer
 * renders `@for (row of body.rows(); ...)`, rows of `columns` items.
 */
@Directive({
    selector: "[monthCalendarGridBody]",
    exportAs: "monthCalendarGridBody",
    host: { "[attr.data-primitives-part]": "calendar.part('grid-body')" },
})
export class MonthCalendarGridBody {
    protected readonly calendar = inject(MONTH_CALENDAR);
    readonly rows = computed<MonthCalendarItem[][]>(() =>
        this.calendar
            .units()
            .rows(this.calendar.pageStart(), this.calendar.columns())
            .map((row) => row.map((index) => this.calendar.itemOf(index))),
    );
}
