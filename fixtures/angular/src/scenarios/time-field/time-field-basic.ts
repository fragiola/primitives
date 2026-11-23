import { Component, input, ViewEncapsulation } from "@angular/core";
import type { PlainTime } from "@fragiola/primitives-angular/time-field";
import { dateField } from "examples-shared/recipes/date-field";
import { field } from "examples-shared/recipes/field";
import { isoTime } from "../../kit/iso.ts";
import { Output } from "../../kit/output.ts";
import { DATE_FIELD_PARTS } from "../date-field/date-field-parts.ts";
import { FieldOutput } from "../date-field/field-output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";

/** spec/date-field.md, `/time-field/basic` */
@Component({
    selector: "[scenario-time-field-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, DATE_FIELD_PARTS, Output],
    template: `
        <div fieldRoot [class]="fieldStyles.root">
            <label fieldLabel [class]="fieldStyles.label">Meeting time</label>
            <div timeFieldRoot [locale]="locale()" (valueChangeDetails)="output.changed($event)" [class]="styles.root">
                <div dateFieldInput #input="dateFieldInput" [class]="styles.input">
                    @for (segment of input.segments(); track segment.index) {
                        <span [dateFieldSegment]="segment">{{ segment.text }}</span>
                    }
                </div>
            </div>
        </div>
        <pre fixtureOutput [values]="{ value: output.value(), reason: output.reason() }"></pre>
    `,
})
export class TimeFieldBasic {
    protected readonly styles = dateField;
    protected readonly fieldStyles = field;
    readonly locale = input.required<string | undefined>();
    protected readonly output = new FieldOutput<PlainTime>((value) =>
        isoTime(value),
    );
}
