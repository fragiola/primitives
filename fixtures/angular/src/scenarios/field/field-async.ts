import { Component, signal, ViewEncapsulation } from "@angular/core";
import { field } from "examples-shared/recipes/field";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "./field-parts.ts";
import { checkUsername } from "./validators.ts";

/** An async `validate`: the latest run wins, an answer is reused (spec/field.md). */
@Component({
    selector: "[scenario-field-async]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-4" (submit)="submit($event)">
            <div fieldRoot [name]="'username'" [validationMode]="'onChange'" [validate]="validate" [class]="styles.root">
                <label fieldLabel [class]="styles.label">Username</label>
                <input fieldControl [class]="styles.control" />
                <div *fieldError [class]="styles.error"></div>
            </div>
            <button type="submit">Submit</button>
        </form>
        <pre fixtureOutput [values]="{ resolved: resolved(), form: form() }"></pre>
    `,
})
export class FieldAsync {
    protected readonly styles = field;
    protected readonly resolved = signal<string | undefined>(undefined);
    protected readonly form = signal<string | undefined>(undefined);
    protected readonly validate = (value: unknown) =>
        checkUsername(value, (text) => this.resolved.set(text));

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
