import {
    afterNextRender,
    DestroyRef,
    Directive,
    inject,
    untracked,
} from "@angular/core";
import { getDirection } from "@fragiola/primitives/direction";
import { interceptEscape } from "@fragiola/primitives/layers";
import { unitKeyTarget } from "@fragiola/primitives/month-year";
import {
    injectFlush,
    injectHost,
    injectProvidedDirection,
} from "@fragiola/primitives-angular/internal";
import { MONTH_CALENDAR } from "../utils/month-calendar-state.ts";

/**
 * The page, as an ARIA grid with the calendar's keys mapped to items (spec/month-calendar.md,
 * "Keyboard"): `<table monthCalendarGrid>`.
 */
@Directive({
    selector: "[monthCalendarGrid]",
    exportAs: "monthCalendarGrid",
    host: {
        role: "grid",
        "[attr.data-primitives-part]": "calendar.part('grid')",
        "[attr.id]": "calendar.gridId()",
        "[attr.aria-labelledby]": "calendar.headingId()",
        "[attr.aria-multiselectable]":
            "calendar.mode === 'range' ? 'true' : null",
        "[attr.aria-readonly]": "calendar.readOnly() ? 'true' : null",
        "[attr.aria-disabled]": "calendar.disabled() ? 'true' : null",
        "(keydown)": "onKeyDown($event)",
    },
})
export class MonthCalendarGrid {
    private readonly direction = injectProvidedDirection();
    protected readonly calendar = inject(MONTH_CALENDAR);
    private readonly flush = injectFlush();

    constructor() {
        const grid = injectHost();
        const calendar = this.calendar;
        // a started range takes Escape before an enclosing overlay's layer (a picker) closes it
        let stop: (() => void) | null = null;
        afterNextRender(() => {
            stop = interceptEscape(
                grid.ownerDocument,
                () => {
                    calendar.cancelRange();
                    this.flush();
                },
                {
                    when: (event) =>
                        untracked(calendar.anchor) !== null &&
                        event.target instanceof Node &&
                        grid.contains(event.target),
                },
            );
        });
        inject(DestroyRef).onDestroy(() => stop?.());
    }

    protected onKeyDown(event: KeyboardEvent): void {
        const calendar = this.calendar;
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            calendar.select(calendar.focused());
            this.flush();
            return;
        }
        const target = unitKeyTarget(event.key, calendar.focused(), {
            rtl:
                getDirection(
                    event.currentTarget as HTMLElement,
                    this.direction(),
                ) === "rtl",
            columns: calendar.columns(),
        });
        if (target === null) {
            return;
        }
        event.preventDefault();
        if (calendar.moveFocus(target)) {
            calendar.requestFocus();
            // the cell of a new page exists, and takes the focus, before the next key
            this.flush();
        }
    }
}
