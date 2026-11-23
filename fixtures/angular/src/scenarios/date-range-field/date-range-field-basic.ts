import { Component, ViewEncapsulation } from "@angular/core";
import type { DateRangeFieldValue } from "@fragiola/primitives-angular/date-range-field";
import { dateField, dateRangeField } from "examples-shared/recipes/date-field";
import { field } from "examples-shared/recipes/field";
import { isoRange } from "../../kit/iso.ts";
import { Output } from "../../kit/output.ts";
import { FieldOutput } from "../date-field/field-output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";
import { RANGE_FIELD_PARTS } from "./range-field-parts.ts";

/** spec/date-range-field.md, `/date-range-field/basic` */
@Component({
    selector: "[scenario-date-range-field-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, RANGE_FIELD_PARTS, Output],
    template: `
        <div fieldRoot [class]="fieldStyles.root">
            <label fieldLabel [class]="fieldStyles.label">Stay</label>
            <div dateRangeFieldRoot [locale]="'en-US'" (valueChangeDetails)="output.changed($event)" [class]="rangeStyles.root">
                <div [class]="rangeStyles.ends"><div dateRangeFieldInput range="start" aria-label="Start date" #startA="dateRangeFieldInput" [class]="styles.input">@for (segment of startA.segments(); track segment.index) {<span [dateFieldSegment]="segment">{{ segment.text }}</span>}</div><span aria-hidden="true" [class]="rangeStyles.separator">–</span><div dateRangeFieldInput range="end" aria-label="End date" #endA="dateRangeFieldInput" [class]="styles.input">@for (segment of endA.segments(); track segment.index) {<span [dateFieldSegment]="segment">{{ segment.text }}</span>}</div></div>
            </div>
        </div>
        <pre fixtureOutput [values]="{ value: output.value(), reason: output.reason() }"></pre>
    `,
})
export class DateRangeFieldBasic {
    protected readonly styles = dateField;
    protected readonly rangeStyles = dateRangeField;
    protected readonly fieldStyles = field;
    protected readonly output = new FieldOutput<DateRangeFieldValue>(isoRange);
}
