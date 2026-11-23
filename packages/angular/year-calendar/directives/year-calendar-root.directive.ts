import {
    Directive,
    forwardRef,
    inject,
    input,
    output,
    type Signal,
} from "@angular/core";
import type { PlainYear } from "@fragiola/primitives/month-year";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/internal";
import {
    MONTH_CALENDAR,
    type MonthCalendarItem,
    MonthCalendarRootBase,
    MonthCalendarState,
    type MonthCalendarValue,
} from "@fragiola/primitives-angular/month-calendar";

/**
 * One year, in a grid of a page of 12 years (spec/month-calendar.md): `<div yearCalendarRoot
 * [(value)]="year">`, with the MonthCalendar's part directives inside (named `year-calendar-*`).
 * Inside a YearPicker, or a calendar's year view, with no value of its own, it binds to it.
 */
@Directive({
    selector: "[yearCalendarRoot]",
    exportAs: "yearCalendarRoot",
    providers: [
        {
            provide: MONTH_CALENDAR,
            useFactory: () =>
                inject(forwardRef(() => YearCalendarRoot)).calendar,
        },
    ],
})
export class YearCalendarRoot extends MonthCalendarRootBase {
    readonly value = input<PlainYear | null | undefined>(undefined);
    readonly valueChange = output<PlainYear | null>();
    readonly defaultValue = input<PlainYear | null | undefined>(undefined);
    readonly valueChangeDetails = output<ValueChangeEvent<PlainYear | null>>();
    /** Years before it are disabled. */
    readonly min = input<PlainYear | null | undefined>(undefined);
    /** Years after it are disabled. */
    readonly max = input<PlainYear | null | undefined>(undefined);
    /** Unavailable years can be focused but not chosen. */
    readonly isUnavailable = input<((year: PlainYear) => boolean) | undefined>(
        undefined,
    );
    readonly calendar = new MonthCalendarState(
        "year-calendar",
        "year",
        "single",
        this.stateInputs({
            value: this.value,
            valueChange: {
                emit: (value: MonthCalendarValue) =>
                    this.valueChange.emit(value as PlainYear | null),
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
                value: value as PlainYear | null,
                details,
            }),
    );
}
