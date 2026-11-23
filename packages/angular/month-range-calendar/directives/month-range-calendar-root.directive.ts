import {
    Directive,
    forwardRef,
    inject,
    input,
    output,
    type Signal,
} from "@angular/core";
import type {
    PlainYearMonth,
    YearMonthRange,
} from "@fragiola/primitives/month-year";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/internal";
import {
    MONTH_CALENDAR,
    type MonthCalendarItem,
    MonthCalendarRootBase,
    MonthCalendarState,
    type MonthCalendarValue,
} from "@fragiola/primitives-angular/month-calendar";

/**
 * A range of months (spec/month-calendar.md): `<div monthRangeCalendarRoot [(value)]="period">`, with the
 * MonthCalendar's part directives inside (named `month-range-calendar-*`). Two choices, swapped when
 * the end comes first. Inside a MonthRangePicker with no value of its own, it binds to it.
 */
@Directive({
    selector: "[monthRangeCalendarRoot]",
    exportAs: "monthRangeCalendarRoot",
    providers: [
        {
            provide: MONTH_CALENDAR,
            useFactory: () =>
                inject(forwardRef(() => MonthRangeCalendarRoot)).calendar,
        },
    ],
})
export class MonthRangeCalendarRoot extends MonthCalendarRootBase {
    readonly value = input<YearMonthRange | null | undefined>(undefined);
    readonly valueChange = output<YearMonthRange | null>();
    readonly defaultValue = input<YearMonthRange | null | undefined>(undefined);
    readonly valueChangeDetails =
        output<ValueChangeEvent<YearMonthRange | null>>();
    /** Months before it are disabled. */
    readonly min = input<PlainYearMonth | null | undefined>(undefined);
    /** Months after it are disabled. */
    readonly max = input<PlainYearMonth | null | undefined>(undefined);
    /** Unavailable months can be focused but not chosen. */
    readonly isUnavailable = input<
        ((month: PlainYearMonth) => boolean) | undefined
    >(undefined);
    readonly calendar = new MonthCalendarState(
        "month-range-calendar",
        "month",
        "range",
        this.stateInputs({
            value: this.value,
            valueChange: {
                emit: (value: MonthCalendarValue) =>
                    this.valueChange.emit(value as YearMonthRange | null),
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
                value: value as YearMonthRange | null,
                details,
            }),
    );
}
