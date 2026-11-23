import { Component, signal, ViewEncapsulation } from "@angular/core";
import { field } from "examples-shared/recipes/field";
import { numberField } from "examples-shared/recipes/number-field";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";
import { NUMBER_FIELD_PARTS } from "./number-field-parts.ts";
import { NumberOutput } from "./number-output.ts";

/** spec/number-field.md, `/number-field/field`: a required NumberField in a Field, not clamped. */
@Component({
    selector: "[scenario-number-field-field]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, NUMBER_FIELD_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <div fieldRoot [name]="'guests'" [class]="fieldStyles.root">
                <label fieldLabel [class]="fieldStyles.label">Guests</label>
                <div numberFieldRoot [required]="true" [min]="1" [max]="8" [clampOnBlur]="false" [locale]="'en-US'" (valueChangeDetails)="output.changed($event)" [class]="styles.root">
                    <div numberFieldGroup [class]="styles.group"><input numberFieldInput [class]="styles.input" /></div>
                </div>
                <p fieldDescription [class]="fieldStyles.description">Up to 8 guests.</p>
                <div *fieldError [class]="fieldStyles.error">Enter between 1 and 8 guests.</div>
            </div>
            <button type="submit">Submit</button>
        </form>
        <pre fixtureOutput [values]="{ value: output.value(), reason: output.reason(), form: form() }"></pre>
    `,
})
export class NumberFieldField {
    protected readonly styles = numberField;
    protected readonly fieldStyles = field;
    protected readonly output = new NumberOutput();
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
