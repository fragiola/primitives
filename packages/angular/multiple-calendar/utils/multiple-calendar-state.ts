import type { Signal } from "@angular/core";
import {
    compareDates,
    isSameDate,
    type PlainDate,
} from "@fragiola/primitives/date";
import {
    type CalendarCellState,
    type CalendarInputs,
    CalendarState,
} from "@fragiola/primitives-angular/calendar";
import type { ChangeDetails } from "@fragiola/primitives-angular/internal";

/** What a MultipleCalendar's state reads besides the calendar's inputs. */
export interface MultipleCalendarDates {
    /** The chosen dates, sorted from the earliest. */
    value: Signal<PlainDate[]>;
    set: (value: PlainDate[], details: ChangeDetails) => void;
    maxSelected: Signal<number | undefined>;
}

/**
 * The state of a MultipleCalendar (spec/calendar.md, "Multiple dates"): the Calendar's, held at
 * the earliest chosen date (its focused date starts there; it is never bound to a picker), with
 * the chosen dates on top. Its mode is `range` for the parts: the Grid's `aria-multiselectable`.
 */
export class MultipleCalendarState extends CalendarState {
    constructor(
        inputs: CalendarInputs,
        private readonly dates: MultipleCalendarDates,
    ) {
        super("multiple-calendar", "range", inputs, () => {});
    }

    private chosen(date: PlainDate): boolean {
        return this.dates.value().some((other) => isSameDate(other, date));
    }

    override cellState(date: PlainDate, month: PlainDate): CalendarCellState {
        return {
            ...super.cellState(date, month),
            selected: this.chosen(date),
        };
    }

    /** Toggles the date: added (up to `maxSelected`) or removed. */
    override select(date: PlainDate): void {
        if (
            this.isOutOfBounds(date) ||
            this.isUnavailable(date) ||
            this.readOnly()
        ) {
            return;
        }
        this.moveFocus(date);
        const dates = this.dates.value();
        if (this.chosen(date)) {
            this.dates.set(
                dates.filter((other) => !isSameDate(other, date)),
                { reason: "item-press" },
            );
            return;
        }
        const max = this.dates.maxSelected();
        if (max === undefined || dates.length < max) {
            this.dates.set([...dates, date].sort(compareDates), {
                reason: "item-press",
            });
        }
    }
}
