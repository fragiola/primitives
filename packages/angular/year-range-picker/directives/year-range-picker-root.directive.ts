import { Directive, forwardRef, inject, input, output } from "@angular/core";
import type { PlainYear, YearRange } from "@fragiola/primitives/month-year";
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
 * A trigger and a popup holding a bound `[yearRangeCalendarRoot]`: a range of years (spec/month-calendar.md):
 * `<ng-container yearRangePickerRoot [(value)]="value">`, with the DatePicker's part directives
 * (`[datePickerTrigger]`, `*datePickerPortal`, `[datePickerPositioner]`, `[datePickerPopup]`, named
 * `year-range-picker-*`).
 */
@Directive({
    selector: "[yearRangePickerRoot]",
    exportAs: "yearRangePickerRoot",
    providers: [
        {
            provide: DATE_PICKER,
            useFactory: () =>
                inject(forwardRef(() => YearRangePickerRoot)).state.picker,
        },
        {
            provide: MONTH_CALENDAR_BINDING,
            useFactory: () =>
                inject(forwardRef(() => YearRangePickerRoot)).state.binding,
        },
    ],
})
export class YearRangePickerRoot extends MonthPickerRootBase {
    readonly value = input<YearRange | null | undefined>(undefined);
    readonly valueChange = output<YearRange | null>();
    readonly defaultValue = input<YearRange | null | undefined>(undefined);
    readonly valueChangeDetails = output<ValueChangeEvent<YearRange | null>>();
    /** Years before it are disabled (passed to the bound calendar). */
    readonly min = input<PlainYear | null | undefined>(undefined);
    /** Years after it are disabled (passed to the bound calendar). */
    readonly max = input<PlainYear | null | undefined>(undefined);
    /** Unavailable years can be focused but not chosen (passed to the bound calendar). */
    readonly isUnavailable = input<((year: PlainYear) => boolean) | undefined>(
        undefined,
    );
    readonly state = createMonthPicker(
        "year-range-picker",
        "year",
        "range",
        {
            open: this.open,
            openChange: this.openChange,
            defaultOpen: this.defaultOpen,
            openChangeComplete: this.openChangeComplete,
            value: this.value,
            valueChange: {
                emit: (value: MonthCalendarValue) =>
                    this.valueChange.emit(value as YearRange | null),
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
                value: value as YearRange | null,
                details,
            }),
    );
}
