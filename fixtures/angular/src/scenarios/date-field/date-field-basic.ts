import { Component, input, ViewEncapsulation } from "@angular/core";
import type { DateFieldValue } from "@fragiola/primitives-angular/date-field";
import { dateField } from "examples-shared/recipes/date-field";
import { field } from "examples-shared/recipes/field";
import { isoDateTime } from "../../kit/iso.ts";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";
import { DATE_FIELD_PARTS } from "./date-field-parts.ts";
import { FieldOutput } from "./field-output.ts";

/** spec/date-field.md, `/date-field/basic` */
@Component({
    selector: "[scenario-date-field-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, DATE_FIELD_PARTS, Output],
    template: `
        <div fieldRoot [class]="fieldStyles.root">
            <label fieldLabel [class]="fieldStyles.label">Birth date</label>
            <div dateFieldRoot [locale]="locale()" (valueChangeDetails)="output.changed($event)" [class]="styles.root">
                <div dateFieldInput #input="dateFieldInput" [class]="styles.input">
                    @for (segment of input.segments(); track segment.index) {
                        <span [dateFieldSegment]="segment" [class]="styles.segment">{{ segment.text }}</span>
                    }
                </div>
            </div>
        </div>
        <pre fixtureOutput [values]="{ value: output.value(), reason: output.reason() }"></pre>
    `,
})
export class DateFieldBasic {
    protected readonly styles = dateField;
    protected readonly fieldStyles = field;
    readonly locale = input.required<string | undefined>();
    protected readonly output = new FieldOutput<DateFieldValue>(isoDateTime);
}
