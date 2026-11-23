import { Component, ViewEncapsulation } from "@angular/core";
import type { TimeRange } from "@fragiola/primitives-angular/time-range-field";
import { dateField, dateRangeField } from "examples-shared/recipes/date-field";
import { field } from "examples-shared/recipes/field";
import { isoTimeRange } from "../../kit/iso.ts";
import { Output } from "../../kit/output.ts";
import { FieldOutput } from "../date-field/field-output.ts";
import { RANGE_FIELD_PARTS } from "../date-range-field/range-field-parts.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";

/** spec/date-range-field.md, `/time-range-field/basic` */
@Component({
    selector: "[scenario-time-range-field-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, RANGE_FIELD_PARTS, Output],
    template: `
        <div fieldRoot [class]="fieldStyles.root">
            <label fieldLabel [class]="fieldStyles.label">Opening hours</label>
            <div timeRangeFieldRoot [locale]="'en-US'" (valueChangeDetails)="output.changed($event)" [class]="rangeStyles.root">
                <div [class]="rangeStyles.ends"><div dateRangeFieldInput range="start" aria-label="Opens" #startA="dateRangeFieldInput" [class]="styles.input">@for (segment of startA.segments(); track segment.index) {<span [dateFieldSegment]="segment">{{ segment.text }}</span>}</div><span aria-hidden="true" [class]="rangeStyles.separator">–</span><div dateRangeFieldInput range="end" aria-label="Closes" #endA="dateRangeFieldInput" [class]="styles.input">@for (segment of endA.segments(); track segment.index) {<span [dateFieldSegment]="segment">{{ segment.text }}</span>}</div></div>
            </div>
        </div>
        <pre fixtureOutput [values]="{ value: output.value(), reason: output.reason() }"></pre>
    `,
})
export class TimeRangeFieldBasic {
    protected readonly styles = dateField;
    protected readonly rangeStyles = dateRangeField;
    protected readonly fieldStyles = field;
    protected readonly output = new FieldOutput<TimeRange>(isoTimeRange);
}
