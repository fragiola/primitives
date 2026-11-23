import { Directive, forwardRef, inject, input, output } from "@angular/core";
import type { PlainYear } from "@fragiola/primitives/month-year";
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
 * A trigger and a popup holding a bound `[yearCalendarRoot]`: one year (spec/month-calendar.md):
 * `<ng-container yearPickerRoot [(value)]="value">`, with the DatePicker's part directives
 * (`[datePickerTrigger]`, `*datePickerPortal`, `[datePickerPositioner]`, `[datePickerPopup]`, named
 * `year-picker-*`).
 */
@Directive({
    selector: "[yearPickerRoot]",
    exportAs: "yearPickerRoot",
    providers: [
        {
            provide: DATE_PICKER,
            useFactory: () =>
                inject(forwardRef(() => YearPickerRoot)).state.picker,
        },
        {
            provide: MONTH_CALENDAR_BINDING,
            useFactory: () =>
                inject(forwardRef(() => YearPickerRoot)).state.binding,
        },
    ],
})
export class YearPickerRoot extends MonthPickerRootBase {
    readonly value = input<PlainYear | null | undefined>(undefined);
    readonly valueChange = output<PlainYear | null>();
    readonly defaultValue = input<PlainYear | null | undefined>(undefined);
    readonly valueChangeDetails = output<ValueChangeEvent<PlainYear | null>>();
    /** Years before it are disabled (passed to the bound calendar). */
    readonly min = input<PlainYear | null | undefined>(undefined);
    /** Years after it are disabled (passed to the bound calendar). */
    readonly max = input<PlainYear | null | undefined>(undefined);
    /** Unavailable years can be focused but not chosen (passed to the bound calendar). */
    readonly isUnavailable = input<((year: PlainYear) => boolean) | undefined>(
        undefined,
    );
    readonly state = createMonthPicker(
        "year-picker",
        "year",
        "single",
        {
            open: this.open,
            openChange: this.openChange,
            defaultOpen: this.defaultOpen,
            openChangeComplete: this.openChangeComplete,
            value: this.value,
            valueChange: {
                emit: (value: MonthCalendarValue) =>
                    this.valueChange.emit(value as PlainYear | null),
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
                value: value as PlainYear | null,
                details,
            }),
    );
}
