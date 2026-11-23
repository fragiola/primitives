import {
    afterNextRender,
    computed,
    DestroyRef,
    Directive,
    inject,
    input,
    numberAttribute,
    untracked,
} from "@angular/core";
import { getDirection } from "@fragiola/primitives/direction";
import { interceptEscape } from "@fragiola/primitives/layers";
import {
    injectFlush,
    injectHost,
    injectProvidedDirection,
} from "@fragiola/primitives-angular/internal";
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
    /** A DirectionProvider's direction, else `null` (the computed one is read). */
    private readonly direction = injectProvidedDirection();
    protected readonly calendar = inject(CALENDAR);
    /** Which visible month it shows (default 0). */
    readonly offset = input(0, { transform: numberAttribute });
    /** The month this grid shows (day 1). */
    readonly month = computed(() =>
        this.calendar
            .math()
            .addMonths(this.calendar.visibleStart(), this.offset()),
    );
    private readonly flush = injectFlush();

    constructor() {
        const grid = injectHost();
        const calendar = this.calendar;
        // a started range takes Escape before an enclosing overlay's layer (a picker, a dialog, a
        // popover) closes it, and the next Escape closes (spec/calendar.md, "Keyboard"). The
        // started range is read when the key comes, never after a render; installed in the
        // browser only (an after render hook never runs on a server)
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
            calendar.select(calendar.focusedDate());
            this.flush();
            return;
        }
        const target = calendar
            .math()
            .keyTarget(event.key, calendar.focusedDate(), {
                rtl:
                    getDirection(
                        event.currentTarget as HTMLElement,
                        this.direction(),
                    ) === "rtl",
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
