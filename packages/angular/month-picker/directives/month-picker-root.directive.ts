import { Directive, forwardRef, inject, input, output } from "@angular/core";
import type { PlainYearMonth } from "@fragiola/primitives/month-year";
import { DATE_PICKER } from "@fragiola/primitives-angular/date-picker";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/internal";
import {
    MONTH_CALENDAR_BINDING,
    type MonthCalendarValue,
} from "@fragiola/primitives-angular/month-calendar";
import { createMonthPicker } from "../utils/month-picker-state.ts";
import { MonthPickerRootBase } from "./month-picker-root-base.ts";

/**
 * A trigger and a popup holding a bound `[monthCalendarRoot]`: one month (spec/month-calendar.md):
 * `<ng-container monthPickerRoot [(value)]="value">`, with the DatePicker's part directives
 * (`[datePickerTrigger]`, `*datePickerPortal`, `[datePickerPositioner]`, `[datePickerPopup]`, named
 * `month-picker-*`).
 */
@Directive({
    selector: "[monthPickerRoot]",
    exportAs: "monthPickerRoot",
    providers: [
        {
            provide: DATE_PICKER,
            useFactory: () =>
                inject(forwardRef(() => MonthPickerRoot)).state.picker,
        },
        {
            provide: MONTH_CALENDAR_BINDING,
            useFactory: () =>
                inject(forwardRef(() => MonthPickerRoot)).state.binding,
        },
    ],
})
export class MonthPickerRoot extends MonthPickerRootBase {
    readonly value = input<PlainYearMonth | null | undefined>(undefined);
    readonly valueChange = output<PlainYearMonth | null>();
    readonly defaultValue = input<PlainYearMonth | null | undefined>(undefined);
    readonly valueChangeDetails =
        output<ValueChangeEvent<PlainYearMonth | null>>();
    /** Months before it are disabled (passed to the bound calendar). */
    readonly min = input<PlainYearMonth | null | undefined>(undefined);
    /** Months after it are disabled (passed to the bound calendar). */
    readonly max = input<PlainYearMonth | null | undefined>(undefined);
    /** Unavailable months can be focused but not chosen (passed to the bound calendar). */
    readonly isUnavailable = input<
        ((month: PlainYearMonth) => boolean) | undefined
    >(undefined);
    readonly state = createMonthPicker(
        "month-picker",
        "month",
        "single",
        {
            open: this.open,
            openChange: this.openChange,
            defaultOpen: this.defaultOpen,
            openChangeComplete: this.openChangeComplete,
            value: this.value,
            valueChange: {
                emit: (value: MonthCalendarValue) =>
                    this.valueChange.emit(value as PlainYearMonth | null),
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
                value: value as PlainYearMonth | null,
                details,
            }),
    );
}
