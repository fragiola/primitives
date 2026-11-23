import { Component, ViewEncapsulation } from "@angular/core";
import type { PlainTime } from "@fragiola/primitives-angular/time-field";
import { dateField } from "examples-shared/recipes/date-field";
import { isoTime } from "../../kit/iso.ts";
import { Output } from "../../kit/output.ts";
import { DATE_FIELD_PARTS } from "../date-field/date-field-parts.ts";
import { FieldOutput } from "../date-field/field-output.ts";

const time = (hour: number): PlainTime => ({
    hour,
    minute: 0,
    second: 0,
    millisecond: 0,
});

/** spec/date-field.md, `/time-field/min-max` */
@Component({
    selector: "[scenario-time-field-min-max]",
    encapsulation: ViewEncapsulation.None,
    imports: [DATE_FIELD_PARTS, Output],
    template: `
        <div timeFieldRoot [locale]="'en-US'" [hourCycle]="24" [granularity]="'second'" [min]="min" [max]="max" [defaultValue]="min" (valueChangeDetails)="output.changed($event)" [class]="styles.root">
            <div dateFieldInput #input="dateFieldInput" aria-label="Opening" [class]="styles.input">
                @for (segment of input.segments(); track segment.index) {
                    <span [dateFieldSegment]="segment">{{ segment.text }}</span>
                }
            </div>
        </div>
        <pre fixtureOutput [values]="{ value: output.value() }"></pre>
    `,
})
export class TimeFieldMinMax {
    protected readonly styles = dateField;
    protected readonly min = time(9);
    protected readonly max = time(17);
    protected readonly output = new FieldOutput<PlainTime>((value) =>
        isoTime(value, true),
    );
}
