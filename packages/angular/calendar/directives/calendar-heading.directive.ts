import {
    computed,
    Directive,
    inject,
    input,
    numberAttribute,
} from "@angular/core";
import { addMonths, formatMonthYear } from "@fragiola/primitives/date";
import { CALENDAR } from "../utils/calendar-state.ts";

/**
 * The month a grid shows: `<h2 calendarHeading #heading="calendarHeading">{{ heading.month() }}</h2>`
 * (from `Intl`, unless the consumer writes its own content).
 */
@Directive({
    selector: "[calendarHeading]",
    exportAs: "calendarHeading",
    host: {
        "[attr.data-primitives-part]": "calendar.part('heading')",
        "[attr.id]": "calendar.headingId(offset())",
        "[attr.aria-live]": "offset() === 0 ? 'polite' : null",
    },
})
export class CalendarHeading {
    protected readonly calendar = inject(CALENDAR);
    /** Which visible month it names (default 0). */
    readonly offset = input(0, { transform: numberAttribute });
    /** The month and year it names, from `Intl`. */
    readonly month = computed(() =>
        formatMonthYear(
            this.calendar.locale(),
            addMonths(this.calendar.visibleStart(), this.offset()),
        ),
    );
}
