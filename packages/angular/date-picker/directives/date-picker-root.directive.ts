import { Directive, forwardRef, inject, input, output } from "@angular/core";
import type { PlainDate } from "@fragiola/primitives/date";
import {
    type CalendarValue,
    PICKER_BINDING,
} from "@fragiola/primitives-angular/calendar";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/internal";
import { createDatePicker, DATE_PICKER } from "../utils/date-picker-state.ts";
import { DatePickerRootBase } from "./date-picker-root-base.ts";

/**
 * A trigger and a popup holding a bound `[calendarRoot]` (spec/calendar.md):
 * `<ng-container datePickerRoot [(value)]="date">`.
 */
@Directive({
    selector: "[datePickerRoot]",
    exportAs: "datePickerRoot",
    providers: [
        {
            provide: DATE_PICKER,
            useFactory: () => inject(forwardRef(() => DatePickerRoot)).picker,
        },
        {
            provide: PICKER_BINDING,
            useFactory: () =>
                inject(forwardRef(() => DatePickerRoot)).picker.binding,
        },
    ],
})
export class DatePickerRoot extends DatePickerRootBase {
    readonly value = input<PlainDate | null | undefined>(undefined);
    readonly valueChange = output<PlainDate | null>();
    readonly defaultValue = input<PlainDate | null | undefined>(undefined);
    readonly valueChangeDetails = output<ValueChangeEvent<PlainDate | null>>();
    readonly picker = createDatePicker(
        "date-picker",
        "single",
        {
            open: this.open,
            openChange: this.openChange,
            defaultOpen: this.defaultOpen,
            openChangeComplete: this.openChangeComplete,
            value: this.value,
            valueChange: {
                emit: (value: CalendarValue) =>
                    this.valueChange.emit(value as PlainDate | null),
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
                value: value as PlainDate | null,
                details,
            }),
    );
}
