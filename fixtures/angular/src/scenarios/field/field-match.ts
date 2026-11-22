import { Component, signal, ViewEncapsulation } from "@angular/core";
import { field } from "examples-shared/recipes/field";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "./field-parts.ts";
import { outOfRange } from "./validators.ts";

/** An Error matching a key, and one matching a function of the validity (spec/field.md). */
@Component({
    selector: "[scenario-field-match]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-4" (submit)="submit($event)">
            <div fieldRoot [name]="'age'" [class]="styles.root">
                <label fieldLabel [class]="styles.label">Age</label>
                <input fieldControl type="number" required min="18" max="120" [class]="styles.control" />
                <div *fieldError="'valueMissing'" [class]="styles.error">Enter your age.</div>
                <div *fieldError="outOfRange" [class]="styles.error">Enter an age from 18 to 120.</div>
            </div>
            <button type="submit">Submit</button>
        </form>
        <pre fixtureOutput [values]="{ form: form() }"></pre>
    `,
})
export class FieldMatch {
    protected readonly styles = field;
    protected readonly outOfRange = outOfRange;
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
