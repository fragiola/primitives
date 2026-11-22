import { computed, Directive, inject } from "@angular/core";
import { monthGrid, type PlainDate } from "@fragiola/primitives/date";
import { CALENDAR } from "../utils/calendar-state.ts";
import { CalendarGrid } from "./calendar-grid.directive.ts";

/**
 * The weeks' section: `<tbody calendarGridBody #body="calendarGridBody">`; the consumer renders
 * `@for (week of body.weeks(); ...)`, 6 weeks of 7 dates.
 */
@Directive({
    selector: "[calendarGridBody]",
    exportAs: "calendarGridBody",
    host: { "[attr.data-primitives-part]": "calendar.part('grid-body')" },
})
export class CalendarGridBody {
    protected readonly calendar = inject(CALENDAR);
    private readonly grid = inject(CalendarGrid);
    readonly weeks = computed<PlainDate[][]>(() => {
        const month = this.grid.month();
        return monthGrid(month.year, month.month, this.calendar.firstDay());
    });
}
