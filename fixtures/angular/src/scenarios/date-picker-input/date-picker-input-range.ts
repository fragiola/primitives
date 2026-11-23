import { Component, ViewEncapsulation } from "@angular/core";
import type { DateRangeFieldValue } from "@fragiola/primitives-angular/date-range-picker-input";
import { calendar } from "examples-shared/recipes/calendar";
import { dateField, dateRangeField } from "examples-shared/recipes/date-field";
import {
    datePicker,
    datePickerInput,
} from "examples-shared/recipes/date-picker";
import { field } from "examples-shared/recipes/field";
import { isoRange } from "../../kit/iso.ts";
import { Output } from "../../kit/output.ts";
import { FieldOutput } from "../date-field/field-output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";
import { TYPED_PICKER_PARTS } from "./typed-picker-parts.ts";

/** spec/calendar.md, `/date-picker-input/range` */
@Component({
    selector: "[scenario-date-picker-input-range]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, TYPED_PICKER_PARTS, Output],
    template: `
        <div fieldRoot [class]="fieldStyles.root">
            <label fieldLabel [class]="fieldStyles.label">Stay</label>
            <ng-container dateRangePickerInputRoot [locale]="'en-US'" (valueChangeDetails)="output.changed($event)">
                <div [class]="pickerStyles.group"><div dateRangeFieldInput range="start" aria-label="Check-in" #start="dateRangeFieldInput" [class]="fieldInputStyles.input">@for (segment of start.segments(); track segment.index) {<span [dateFieldSegment]="segment">{{ segment.text }}</span>}</div><span aria-hidden="true" [class]="rangeStyles.separator">–</span><div dateRangeFieldInput range="end" aria-label="Check-out" #end="dateRangeFieldInput" [class]="fieldInputStyles.input">@for (segment of end.segments(); track segment.index) {<span [dateFieldSegment]="segment">{{ segment.text }}</span>}</div><button datePickerTrigger [class]="pickerStyles.trigger" aria-label="Choose dates"><span aria-hidden="true">▾</span></button></div>
                <ng-container *datePickerPortal><div datePickerPositioner [sideOffset]="4" [class]="popupStyles.positioner"><div datePickerPopup aria-label="Choose dates" [class]="popupStyles.popup"><div rangeCalendarRoot [class]="calendarStyles.root"><div monthView></div></div></div></div></ng-container>
            </ng-container>
        </div>
        <pre fixtureOutput [values]="{ value: output.value(), reason: output.reason() }"></pre>
    `,
})
export class DatePickerInputRange {
    protected readonly fieldStyles = field;
    protected readonly fieldInputStyles = dateField;
    protected readonly rangeStyles = dateRangeField;
    protected readonly pickerStyles = datePickerInput;
    protected readonly popupStyles = datePicker;
    protected readonly calendarStyles = calendar;
    protected readonly output = new FieldOutput<DateRangeFieldValue>(isoRange);
}
