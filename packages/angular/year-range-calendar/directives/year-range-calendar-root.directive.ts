import {
    Directive,
    forwardRef,
    inject,
    input,
    output,
    type Signal,
} from "@angular/core";
import type { PlainYear, YearRange } from "@fragiola/primitives/month-year";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/internal";
import {
    MONTH_CALENDAR,
    type MonthCalendarItem,
    MonthCalendarRootBase,
    MonthCalendarState,
    type MonthCalendarValue,
} from "@fragiola/primitives-angular/month-calendar";

/**
 * A range of years (spec/month-calendar.md): `<div yearRangeCalendarRoot [(value)]="years">`, with the
 * MonthCalendar's part directives inside (named `year-range-calendar-*`). Two choices, swapped when
 * the end comes first. Inside a YearRangePicker with no value of its own, it binds to it.
 */
@Directive({
    selector: "[yearRangeCalendarRoot]",
    exportAs: "yearRangeCalendarRoot",
    providers: [
        {
            provide: MONTH_CALENDAR,
            useFactory: () =>
                inject(forwardRef(() => YearRangeCalendarRoot)).calendar,
        },
    ],
})
export class YearRangeCalendarRoot extends MonthCalendarRootBase {
    readonly value = input<YearRange | null | undefined>(undefined);
    readonly valueChange = output<YearRange | null>();
    readonly defaultValue = input<YearRange | null | undefined>(undefined);
    readonly valueChangeDetails = output<ValueChangeEvent<YearRange | null>>();
    /** Years before it are disabled. */
    readonly min = input<PlainYear | null | undefined>(undefined);
    /** Years after it are disabled. */
    readonly max = input<PlainYear | null | undefined>(undefined);
    /** Unavailable years can be focused but not chosen. */
    readonly isUnavailable = input<((year: PlainYear) => boolean) | undefined>(
        undefined,
    );
    readonly calendar = new MonthCalendarState(
        "year-range-calendar",
        "year",
        "range",
        this.stateInputs({
            value: this.value,
            valueChange: {
                emit: (value: MonthCalendarValue) =>
                    this.valueChange.emit(value as YearRange | null),
            },
            defaultValue: this.defaultValue,
            min: this.min,
            max: this.max,
            isUnavailable: this.isUnavailable as Signal<
                ((item: MonthCalendarItem) => boolean) | undefined
            >,
        }),
        (value, details) =>
            this.valueChangeDetails.emit({
                value: value as YearRange | null,
                details,
            }),
    );
}
