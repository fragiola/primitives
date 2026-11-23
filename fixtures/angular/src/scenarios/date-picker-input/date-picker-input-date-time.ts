import { Component, ViewEncapsulation } from "@angular/core";
import type { DateFieldValue } from "@fragiola/primitives-angular/date-picker-input";
import { calendar } from "examples-shared/recipes/calendar";
import { dateField } from "examples-shared/recipes/date-field";
import {
    datePicker,
    datePickerInput,
} from "examples-shared/recipes/date-picker";
import { field } from "examples-shared/recipes/field";
import { isoDateTime } from "../../kit/iso.ts";
import { Output } from "../../kit/output.ts";
import { FieldOutput } from "../date-field/field-output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";
import { TYPED_PICKER_PARTS } from "./typed-picker-parts.ts";

/** spec/calendar.md, `/date-picker-input/date-time` */
@Component({
    selector: "[scenario-date-picker-input-date-time]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, TYPED_PICKER_PARTS, Output],
    template: `
        <div fieldRoot [class]="fieldStyles.root">
            <label fieldLabel [class]="fieldStyles.label">Meeting</label>
            <ng-container datePickerInputRoot [locale]="'en-US'" [granularity]="'minute'" (valueChangeDetails)="output.changed($event)">
                <div [class]="pickerStyles.group"><div dateFieldInput #segments="dateFieldInput" [class]="fieldInputStyles.input">@for (segment of segments.segments(); track segment.index) {<span [dateFieldSegment]="segment">{{ segment.text }}</span>}</div><button datePickerTrigger [class]="pickerStyles.trigger" aria-label="Choose date"><span aria-hidden="true">▾</span></button></div>
                <ng-container *datePickerPortal><div datePickerPositioner [sideOffset]="4" [class]="popupStyles.positioner"><div datePickerPopup aria-label="Choose date" [class]="popupStyles.popup"><div calendarRoot [class]="calendarStyles.root"><div monthView></div></div></div></div></ng-container>
            </ng-container>
        </div>
        <pre fixtureOutput [values]="{ value: output.value(), reason: output.reason() }"></pre>
    `,
})
export class DatePickerInputDateTime {
    protected readonly fieldStyles = field;
    protected readonly fieldInputStyles = dateField;
    protected readonly pickerStyles = datePickerInput;
    protected readonly popupStyles = datePicker;
    protected readonly calendarStyles = calendar;
    protected readonly output = new FieldOutput<DateFieldValue>(isoDateTime);
}
