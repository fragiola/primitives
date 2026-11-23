import { Directive, inject } from "@angular/core";
import { MONTH_CALENDAR } from "../utils/month-calendar-state.ts";

/** One row of items: `<tr monthCalendarRow>`; the consumer renders its items. */
@Directive({
    selector: "[monthCalendarRow]",
    host: { "[attr.data-primitives-part]": "calendar.part('row')" },
})
export class MonthCalendarRow {
    protected readonly calendar = inject(MONTH_CALENDAR);
}
