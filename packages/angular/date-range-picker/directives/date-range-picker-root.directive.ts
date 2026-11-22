import { Directive, forwardRef, inject, input, output } from "@angular/core";
import type { DateRange } from "@fragiola/primitives/date";
import {
    type CalendarValue,
    PICKER_BINDING,
} from "@fragiola/primitives-angular/calendar";
import {
    createDatePicker,
    DATE_PICKER,
    DatePickerRootBase,
} from "@fragiola/primitives-angular/date-picker";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/internal";

/**
 * A trigger and a popup holding a bound `[rangeCalendarRoot]` (spec/calendar.md):
 * `<ng-container dateRangePickerRoot [(value)]="range">`, with the DatePicker's part directives
 * (named `date-range-picker-*`).
 */
@Directive({
    selector: "[dateRangePickerRoot]",
    exportAs: "dateRangePickerRoot",
    providers: [
        {
            provide: DATE_PICKER,
            useFactory: () =>
                inject(forwardRef(() => DateRangePickerRoot)).picker,
        },
        {
            provide: PICKER_BINDING,
            useFactory: () =>
                inject(forwardRef(() => DateRangePickerRoot)).picker.binding,
        },
    ],
})
export class DateRangePickerRoot extends DatePickerRootBase {
    readonly value = input<DateRange | null | undefined>(undefined);
    readonly valueChange = output<DateRange | null>();
    readonly defaultValue = input<DateRange | null | undefined>(undefined);
    readonly valueChangeDetails = output<ValueChangeEvent<DateRange | null>>();
    readonly picker = createDatePicker(
        "date-range-picker",
        "range",
        {
            open: this.open,
            openChange: this.openChange,
            defaultOpen: this.defaultOpen,
            value: this.value,
            valueChange: {
                emit: (value: CalendarValue) =>
                    this.valueChange.emit(value as DateRange | null),
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
                value: value as DateRange | null,
                details,
            }),
    );
}
