import { Component, signal, ViewEncapsulation } from "@angular/core";
import { CalendarPreset } from "@fragiola/primitives-angular/calendar-preset";
import type {
    DateRange,
    DateRangeFieldValue,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/date-range-picker-input";
import { calendar, calendarPreset } from "examples-shared/recipes/calendar";
import { dateField, dateRangeField } from "examples-shared/recipes/date-field";
import {
    datePicker,
    datePickerInput,
} from "examples-shared/recipes/date-picker";
import { field } from "examples-shared/recipes/field";
import { isoRange } from "../../kit/iso.ts";
import { Output } from "../../kit/output.ts";
import { TYPED_PICKER_PARTS } from "../date-picker-input/typed-picker-parts.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";

/** spec/calendar.md, `/calendar-preset/picker` */
@Component({
    selector: "[scenario-calendar-preset-picker]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, TYPED_PICKER_PARTS, CalendarPreset, Output],
    template: `
        <div fieldRoot [class]="fieldStyles.root">
            <label fieldLabel [class]="fieldStyles.label">Stay</label>
            <ng-container dateRangePickerInputRoot [locale]="'en-US'" (valueChangeDetails)="changed($event)">
                <div [class]="pickerStyles.group"><div dateRangeFieldInput range="start" aria-label="Check-in" #start="dateRangeFieldInput" [class]="fieldInputStyles.input">@for (segment of start.segments(); track segment.index) {<span [dateFieldSegment]="segment">{{ segment.text }}</span>}</div><span aria-hidden="true" [class]="rangeStyles.separator">–</span><div dateRangeFieldInput range="end" aria-label="Check-out" #end="dateRangeFieldInput" [class]="fieldInputStyles.input">@for (segment of end.segments(); track segment.index) {<span [dateFieldSegment]="segment">{{ segment.text }}</span>}</div><button datePickerTrigger [class]="pickerStyles.trigger" aria-label="Choose dates"><span aria-hidden="true">▾</span></button></div>
                <ng-container *datePickerPortal><div datePickerPositioner [sideOffset]="4" [class]="popupStyles.positioner"><div datePickerPopup aria-label="Choose dates" [class]="popupStyles.popup"><div rangeCalendarRoot [class]="calendarStyles.root"><div monthView></div><div [class]="presetStyles.list"><button [calendarPreset]="thisWeekend" [class]="presetStyles.preset">This weekend</button><button [calendarPreset]="nextWeek" [class]="presetStyles.preset">Next week</button></div></div></div></div></ng-container>
            </ng-container>
        </div>
        <pre fixtureOutput [values]="{ value: last()?.value, reason: last()?.reason, changes: changes() }"></pre>
    `,
})
export class CalendarPresetPicker {
    protected readonly fieldStyles = field;
    protected readonly fieldInputStyles = dateField;
    protected readonly rangeStyles = dateRangeField;
    protected readonly pickerStyles = datePickerInput;
    protected readonly popupStyles = datePicker;
    protected readonly calendarStyles = calendar;
    protected readonly presetStyles = calendarPreset;
    protected readonly thisWeekend: DateRange = {
        start: { year: 2026, month: 11, day: 21 },
        end: { year: 2026, month: 11, day: 22 },
    };
    protected readonly nextWeek: DateRange = {
        start: { year: 2026, month: 11, day: 23 },
        end: { year: 2026, month: 11, day: 29 },
    };
    protected readonly last = signal<{ value: string; reason: string } | null>(
        null,
    );
    protected readonly changes = signal(0);

    protected changed({
        value,
        details,
    }: ValueChangeEvent<DateRangeFieldValue | null>): void {
        this.changes.update((count) => count + 1);
        this.last.set({
            value: isoRange(value) ?? "none",
            reason: details.reason,
        });
    }
}
