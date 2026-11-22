import { Directive, forwardRef, inject, input, output } from "@angular/core";
import type { DateRange } from "@fragiola/primitives/date";
import {
    CALENDAR,
    CalendarRootBase,
    CalendarState,
    type CalendarValue,
} from "@fragiola/primitives-angular/calendar";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/internal";

/**
 * A range of dates (spec/calendar.md): `<div rangeCalendarRoot [(value)]="range">`, with the
 * Calendar's part directives inside (named `range-calendar-*`). Two choices, swapped when the end
 * comes first. Inside a DateRangePicker with no value of its own, it binds to it.
 */
@Directive({
    selector: "[rangeCalendarRoot]",
    exportAs: "rangeCalendarRoot",
    providers: [
        {
            provide: CALENDAR,
            useFactory: () =>
                inject(forwardRef(() => RangeCalendarRoot)).calendar,
        },
    ],
})
export class RangeCalendarRoot extends CalendarRootBase {
    readonly value = input<DateRange | null | undefined>(undefined);
    readonly valueChange = output<DateRange | null>();
    readonly defaultValue = input<DateRange | null | undefined>(undefined);
    readonly valueChangeDetails = output<ValueChangeEvent<DateRange | null>>();
    readonly calendar = new CalendarState(
        "range-calendar",
        "range",
        this.stateInputs(
            this.value,
            {
                emit: (value: CalendarValue) =>
                    this.valueChange.emit(value as DateRange | null),
            },
            this.defaultValue,
        ),
        (value, details) =>
            this.valueChangeDetails.emit({
                value: value as DateRange | null,
                details,
            }),
    );
}
