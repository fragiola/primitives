import {
    computed,
    Directive,
    inject,
    input,
    numberAttribute,
} from "@angular/core";
import { addMonths, calendarKeyTarget } from "@fragiola/primitives/date";
import { getDirection } from "@fragiola/primitives/direction";
import { injectFlush } from "@fragiola/primitives-angular/internal";
import { CALENDAR } from "../utils/calendar-state.ts";

/**
 * One month, as an ARIA grid with the APG date grid keyboard (spec/calendar.md, "Keyboard"):
 * `<table calendarGrid [offset]="0">`.
 */
@Directive({
    selector: "[calendarGrid]",
    exportAs: "calendarGrid",
    host: {
        role: "grid",
        "[attr.data-primitives-part]": "calendar.part('grid')",
        "[attr.id]": "calendar.gridId(offset())",
        "[attr.aria-labelledby]": "calendar.headingId(offset())",
        "[attr.aria-multiselectable]":
            "calendar.mode === 'range' ? 'true' : null",
        "[attr.aria-readonly]": "calendar.readOnly() ? 'true' : null",
        "[attr.aria-disabled]": "calendar.disabled() ? 'true' : null",
        "(keydown)": "onKeyDown($event)",
    },
})
export class CalendarGrid {
    protected readonly calendar = inject(CALENDAR);
    /** Which visible month it shows (default 0). */
    readonly offset = input(0, { transform: numberAttribute });
    /** The month this grid shows (day 1). */
    readonly month = computed(() =>
        addMonths(this.calendar.visibleStart(), this.offset()),
    );
    private readonly flush = injectFlush();

    protected onKeyDown(event: KeyboardEvent): void {
        const calendar = this.calendar;
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            calendar.select(calendar.focusedDate());
            this.flush();
            return;
        }
        if (event.key === "Escape") {
            if (calendar.anchor() !== null) {
                event.preventDefault();
                calendar.cancelRange();
            }
            return;
        }
        const target = calendarKeyTarget(event.key, calendar.focusedDate(), {
            rtl: getDirection(event.currentTarget as HTMLElement) === "rtl",
            firstDayOfWeek: calendar.firstDay(),
            shiftKey: event.shiftKey,
        });
        if (target === null) {
            return;
        }
        event.preventDefault();
        if (calendar.moveFocus(target)) {
            calendar.requestFocus();
            // the cell of a new month exists, and takes the focus, before the next key
            // (AGENTS.md "Porting", 8)
            this.flush();
        }
    }
}
