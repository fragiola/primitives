import { Component, ViewEncapsulation } from "@angular/core";
import type {
    DateFieldValue,
    PlainDate,
} from "@fragiola/primitives-angular/date-field";
import { dateField } from "examples-shared/recipes/date-field";
import { isoDateTime } from "../../kit/iso.ts";
import { Output } from "../../kit/output.ts";
import { DATE_FIELD_PARTS } from "./date-field-parts.ts";
import { FieldOutput } from "./field-output.ts";

/** Saturdays and Sundays. */
function isWeekend(date: PlainDate): boolean {
    const day = new Date(
        Date.UTC(date.year, date.month - 1, date.day),
    ).getUTCDay();
    return day === 0 || day === 6;
}

/** spec/date-field.md, `/date-field/min-max` */
@Component({
    selector: "[scenario-date-field-min-max]",
    encapsulation: ViewEncapsulation.None,
    imports: [DATE_FIELD_PARTS, Output],
    template: `
        <div dateFieldRoot [locale]="'en-US'" [min]="min" [max]="max" [isDateUnavailable]="isWeekend" (valueChangeDetails)="output.changed($event)" [class]="styles.root">
            <div dateFieldInput #input="dateFieldInput" aria-label="Arrival" [class]="styles.input">
                @for (segment of input.segments(); track segment.index) {
                    <span [dateFieldSegment]="segment">{{ segment.text }}</span>
                }
            </div>
        </div>
        <pre fixtureOutput [values]="{ value: output.value() }"></pre>
    `,
})
export class DateFieldMinMax {
    protected readonly styles = dateField;
    protected readonly min: PlainDate = { year: 2026, month: 11, day: 10 };
    protected readonly max: PlainDate = { year: 2026, month: 12, day: 5 };
    protected readonly isWeekend = isWeekend;
    protected readonly output = new FieldOutput<DateFieldValue>(isoDateTime);
}
