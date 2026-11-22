import { computed, Directive, inject } from "@angular/core";
import { weekdays } from "@fragiola/primitives/date";
import { CALENDAR } from "../utils/calendar-state.ts";

/**
 * The weekdays row's section: `<thead calendarGridHeader #header="calendarGridHeader">`; the
 * consumer renders `@for (weekday of header.weekdays(); ...)` (the children function, in Angular).
 */
@Directive({
    selector: "[calendarGridHeader]",
    exportAs: "calendarGridHeader",
    host: { "[attr.data-primitives-part]": "calendar.part('grid-header')" },
})
export class CalendarGridHeader {
    protected readonly calendar = inject(CALENDAR);
    /** The weekdays, in the locale's order. */
    readonly weekdays = computed(() =>
        weekdays(this.calendar.locale(), this.calendar.firstDay()),
    );
}
