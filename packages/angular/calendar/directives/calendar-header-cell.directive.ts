import { Directive, inject, input } from "@angular/core";
import type { Weekday } from "@fragiola/primitives/date";
import { CALENDAR } from "../utils/calendar-state.ts";

/** One weekday: `<th calendarHeaderCell [weekday]="weekday">{{ weekday.short }}</th>` (its long name as `abbr`). */
@Directive({
    selector: "[calendarHeaderCell]",
    exportAs: "calendarHeaderCell",
    host: {
        scope: "col",
        "[attr.data-primitives-part]": "calendar.part('header-cell')",
        "[attr.abbr]": "weekday().long",
    },
})
export class CalendarHeaderCell {
    protected readonly calendar = inject(CALENDAR);
    readonly weekday = input.required<Weekday>();
}
