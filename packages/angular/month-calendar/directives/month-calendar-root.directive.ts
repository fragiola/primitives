import {
    Directive,
    forwardRef,
    inject,
    input,
    output,
    type Signal,
} from "@angular/core";
import type { PlainYearMonth } from "@fragiola/primitives/month-year";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/internal";
import {
    MONTH_CALENDAR,
    MonthCalendarState,
} from "../utils/month-calendar-state.ts";
import type {
    MonthCalendarItem,
    MonthCalendarValue,
} from "../utils/month-calendar-value.ts";
import { MonthCalendarRootBase } from "./month-calendar-root-base.ts";

/**
 * One month (spec/month-calendar.md): `<div monthCalendarRoot [(value)]="month">`. Inside a
 * MonthPicker, or a calendar's month view, with no value of its own, it binds to it.
 */
@Directive({
    selector: "[monthCalendarRoot]",
    exportAs: "monthCalendarRoot",
    providers: [
        {
            provide: MONTH_CALENDAR,
            useFactory: () =>
                inject(forwardRef(() => MonthCalendarRoot)).calendar,
        },
    ],
})
export class MonthCalendarRoot extends MonthCalendarRootBase {
    readonly value = input<PlainYearMonth | null | undefined>(undefined);
    readonly valueChange = output<PlainYearMonth | null>();
    readonly defaultValue = input<PlainYearMonth | null | undefined>(undefined);
    readonly valueChangeDetails =
        output<ValueChangeEvent<PlainYearMonth | null>>();
    /** Months before it are disabled. */
    readonly min = input<PlainYearMonth | null | undefined>(undefined);
    /** Months after it are disabled. */
    readonly max = input<PlainYearMonth | null | undefined>(undefined);
    /** Unavailable months can be focused but not chosen. */
    readonly isUnavailable = input<
        ((month: PlainYearMonth) => boolean) | undefined
    >(undefined);
    readonly calendar = new MonthCalendarState(
        "month-calendar",
        "month",
        "single",
        this.stateInputs({
            value: this.value,
            valueChange: {
                emit: (value: MonthCalendarValue) =>
                    this.valueChange.emit(value as PlainYearMonth | null),
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
                value: value as PlainYearMonth | null,
                details,
            }),
    );
}
