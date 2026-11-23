import { computed, Directive, inject, input } from "@angular/core";
import {
    type DateRange,
    isSameDate,
    type PlainDate,
    today,
} from "@fragiola/primitives/date";
import {
    CALENDAR,
    type CalendarState,
} from "@fragiola/primitives-angular/calendar";
import { dataValues, injectFlush } from "@fragiola/primitives-angular/internal";

/** A preset's value: a date, a range, or a function of today returning one. */
export type CalendarPresetValue =
    | PlainDate
    | DateRange
    | ((today: PlainDate) => PlainDate | DateRange);

export interface CalendarPresetState {
    /** The calendar's value is the preset's. */
    selected: boolean;
    /** It cannot be chosen (the calendar is disabled or read-only, or a date is out of reach). */
    disabled: boolean;
}

/** The preset's dates in its calendar, or `null` when the calendar cannot hold it. */
function presetRange(
    calendar: CalendarState,
    value: CalendarPresetValue,
): DateRange | null {
    const resolved = typeof value === "function" ? value(today()) : value;
    if ("start" in resolved) {
        return calendar.mode === "range" ? resolved : null;
    }
    return { start: resolved, end: resolved };
}

/**
 * A button that sets its calendar's value to a known date or range (spec/calendar.md, "Presets"):
 * `<button [calendarPreset]="christmas">Christmas</button>`, inside a `[calendarRoot]` or a
 * `[rangeCalendarRoot]`, inline or in a picker. The label is the consumer's.
 */
@Directive({
    selector: "[calendarPreset]",
    exportAs: "calendarPreset",
    host: {
        type: "button",
        "[attr.data-primitives-part]": "calendar.part('preset')",
        "[attr.disabled]": "data().disabled",
        "[attr.data-selected]": "data().selected",
        "[attr.data-disabled]": "data().disabled",
        "(click)": "onClick()",
    },
})
export class CalendarPreset {
    protected readonly calendar = inject(CALENDAR);
    /** A date, a range, or a function of today returning one. */
    readonly value = input.required<CalendarPresetValue>({
        alias: "calendarPreset",
    });
    private readonly flush = injectFlush();
    private readonly range = computed(() =>
        presetRange(this.calendar, this.value()),
    );
    readonly state = computed<CalendarPresetState>(() => {
        const calendar = this.calendar;
        const range = this.range();
        const blocked = (date: PlainDate) =>
            calendar.isOutOfBounds(date) || calendar.isUnavailable(date);
        const disabled =
            range === null ||
            calendar.disabled() ||
            calendar.readOnly() ||
            blocked(range.start) ||
            blocked(range.end);
        let selected = false;
        if (range !== null) {
            if (calendar.mode === "range") {
                const current = calendar.rangeValue();
                selected =
                    current !== null &&
                    isSameDate(current.start, range.start) &&
                    isSameDate(current.end, range.end);
            } else {
                selected = calendar.cellState(
                    range.start,
                    range.start,
                ).selected;
            }
        }
        return { selected, disabled };
    });
    protected readonly data = computed(() => dataValues(this.state()));

    protected onClick(): void {
        const calendar = this.calendar;
        const target = presetRange(calendar, this.value());
        if (target === null || this.state().disabled) {
            return;
        }
        calendar.moveFocus(target.start);
        calendar.moveFocus(target.end);
        if (calendar.mode !== "range") {
            calendar.select(target.start);
        } else {
            // a range started in the grid is dropped, then the two ends are chosen
            calendar.cancelRange();
            calendar.select(target.start);
            calendar.select(target.end);
        }
        this.flush();
    }
}
