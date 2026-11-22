import { Directive, inject } from "@angular/core";
import { CALENDAR } from "../utils/calendar-state.ts";

/** One week: `<tr calendarRow>`; the consumer renders its dates. */
@Directive({
    selector: "[calendarRow]",
    host: { "[attr.data-primitives-part]": "calendar.part('row')" },
})
export class CalendarRow {
    protected readonly calendar = inject(CALENDAR);
}
