import { Component, signal, ViewEncapsulation } from "@angular/core";
import { Label } from "@fragiola/primitives-angular/label";
import { label } from "examples-shared/recipes/label";
import { numberField } from "examples-shared/recipes/number-field";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { NUMBER_FIELD_PARTS } from "./number-field-parts.ts";
import { NumberOutput } from "./number-output.ts";

/** spec/number-field.md, `/number-field/basic`: a quantity in a native form. */
@Component({
    selector: "[scenario-number-field-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [Label, NUMBER_FIELD_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <label label for="quantity" [class]="labelStyles.root">Quantity</label>
            <div numberFieldRoot [id]="'quantity'" [name]="'quantity'" [defaultValue]="1" [min]="1" [max]="10" [largeStep]="5" [locale]="'en-US'" (valueChangeDetails)="output.changed($event)" [class]="styles.root">
                <div numberFieldGroup [class]="styles.group"><button numberFieldDecrement aria-label="Decrease" [class]="styles.decrement">−</button><input numberFieldInput [class]="styles.input" /><button numberFieldIncrement aria-label="Increase" [class]="styles.increment">+</button></div>
            </div>
            <div class="flex gap-2">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
            </div>
        </form>
        <pre fixtureOutput [values]="{ value: output.value(), reason: output.reason(), form: form() }"></pre>
    `,
})
export class NumberFieldBasic {
    protected readonly styles = numberField;
    protected readonly labelStyles = label;
    protected readonly output = new NumberOutput();
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
