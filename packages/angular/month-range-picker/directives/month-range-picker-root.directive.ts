import { Directive, forwardRef, inject, input, output } from "@angular/core";
import type {
    PlainYearMonth,
    YearMonthRange,
} from "@fragiola/primitives/month-year";
import { DATE_PICKER } from "@fragiola/primitives-angular/date-picker";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/internal";
import {
    MONTH_CALENDAR_BINDING,
    type MonthCalendarValue,
} from "@fragiola/primitives-angular/month-calendar";
import {
    createMonthPicker,
    MonthPickerRootBase,
} from "@fragiola/primitives-angular/month-picker";

/**
 * A trigger and a popup holding a bound `[monthRangeCalendarRoot]`: a range of months (spec/month-calendar.md):
 * `<ng-container monthRangePickerRoot [(value)]="value">`, with the DatePicker's part directives
 * (`[datePickerTrigger]`, `*datePickerPortal`, `[datePickerPositioner]`, `[datePickerPopup]`, named
 * `month-range-picker-*`).
 */
@Directive({
    selector: "[monthRangePickerRoot]",
    exportAs: "monthRangePickerRoot",
    providers: [
        {
            provide: DATE_PICKER,
            useFactory: () =>
                inject(forwardRef(() => MonthRangePickerRoot)).state.picker,
        },
        {
            provide: MONTH_CALENDAR_BINDING,
            useFactory: () =>
                inject(forwardRef(() => MonthRangePickerRoot)).state.binding,
        },
    ],
})
export class MonthRangePickerRoot extends MonthPickerRootBase {
    readonly value = input<YearMonthRange | null | undefined>(undefined);
    readonly valueChange = output<YearMonthRange | null>();
    readonly defaultValue = input<YearMonthRange | null | undefined>(undefined);
    readonly valueChangeDetails =
        output<ValueChangeEvent<YearMonthRange | null>>();
    /** Months before it are disabled (passed to the bound calendar). */
    readonly min = input<PlainYearMonth | null | undefined>(undefined);
    /** Months after it are disabled (passed to the bound calendar). */
    readonly max = input<PlainYearMonth | null | undefined>(undefined);
    /** Unavailable months can be focused but not chosen (passed to the bound calendar). */
    readonly isUnavailable = input<
        ((month: PlainYearMonth) => boolean) | undefined
    >(undefined);
    readonly state = createMonthPicker(
        "month-range-picker",
        "month",
        "range",
        {
            open: this.open,
            openChange: this.openChange,
            defaultOpen: this.defaultOpen,
            openChangeComplete: this.openChangeComplete,
            value: this.value,
            valueChange: {
                emit: (value: MonthCalendarValue) =>
                    this.valueChange.emit(value as YearMonthRange | null),
            },
            defaultValue: this.defaultValue,
            options: this.options,
            name: this.name,
            required: this.required,
            disabled: this.disabled,
            readOnly: this.readOnly,
        },
        (event) => this.openChangeDetails.emit(event),
        (value, details) =>
            this.valueChangeDetails.emit({
                value: value as YearMonthRange | null,
                details,
            }),
    );
}
