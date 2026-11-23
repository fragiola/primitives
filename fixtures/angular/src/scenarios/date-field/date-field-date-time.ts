import { Component, input, signal, ViewEncapsulation } from "@angular/core";
import type { DateFieldValue } from "@fragiola/primitives-angular/date-field";
import { dateField } from "examples-shared/recipes/date-field";
import { field } from "examples-shared/recipes/field";
import { formEntries } from "../../kit/form-entries.ts";
import { isoDateTime } from "../../kit/iso.ts";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";
import { DATE_FIELD_PARTS } from "./date-field-parts.ts";
import { FieldOutput } from "./field-output.ts";

/** spec/date-field.md, `/date-field/date-time` */
@Component({
    selector: "[scenario-date-field-date-time]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, DATE_FIELD_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <div fieldRoot [name]="'meeting'" [class]="fieldStyles.root">
                <label fieldLabel [class]="fieldStyles.label">Meeting</label>
                <div dateFieldRoot [locale]="locale()" [granularity]="'minute'" (valueChangeDetails)="output.changed($event)" [class]="styles.root">
                    <div dateFieldInput #input="dateFieldInput" [class]="styles.input">
                        @for (segment of input.segments(); track segment.index) {
                            <span [dateFieldSegment]="segment">{{ segment.text }}</span>
                        }
                    </div>
                </div>
            </div>
            <button type="submit">Submit</button>
        </form>
        <pre fixtureOutput [values]="{ value: output.value(), reason: output.reason(), form: form() }"></pre>
    `,
})
export class DateFieldDateTime {
    protected readonly styles = dateField;
    protected readonly fieldStyles = field;
    readonly locale = input.required<string | undefined>();
    protected readonly output = new FieldOutput<DateFieldValue>(isoDateTime);
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
