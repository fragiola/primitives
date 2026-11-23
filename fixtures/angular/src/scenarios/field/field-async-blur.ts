import { Component, signal, ViewEncapsulation } from "@angular/core";
import { field } from "examples-shared/recipes/field";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "./field-parts.ts";
import { checkUsernameSlowly } from "./validators.ts";

/** spec/field.md, `/field/async-blur`: a change hides the error an earlier run showed, at once. */
@Component({
    selector: "[scenario-field-async-blur]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, Output],
    template: `
        <div class="flex flex-col items-start gap-4">
            <div fieldRoot [name]="'username'" [validationMode]="'onBlur'" [validate]="validate" [class]="styles.root">
                <label fieldLabel [class]="styles.label">Username</label>
                <input fieldControl [class]="styles.control" />
                <div *fieldError [class]="styles.error"></div>
            </div>
            <button type="button">After</button>
        </div>
        <pre fixtureOutput [values]="{ resolved: resolved() }"></pre>
    `,
})
export class FieldAsyncBlur {
    protected readonly styles = field;
    protected readonly resolved = signal<string | undefined>(undefined);
    protected readonly validate = (value: unknown) =>
        checkUsernameSlowly(value, (text) => this.resolved.set(text));
}
