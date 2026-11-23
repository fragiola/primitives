import { Component, signal, ViewEncapsulation } from "@angular/core";
import { field } from "examples-shared/recipes/field";
import { passwordInput } from "examples-shared/recipes/password-input";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";
import {
    PASSWORD_INPUT_PARTS,
    visibilityTrigger,
} from "./password-input-parts.ts";

/** A required new password in a Field (spec/password-input.md, `/password-input/field`). */
@Component({
    selector: "[scenario-password-input-field]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, PASSWORD_INPUT_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-4" (submit)="submit($event)">
            <div fieldRoot class="${field.root}">
                <label fieldLabel class="${field.label}">New password</label>
                <div passwordInputRoot [required]="true" [name]="'new-password'" class="${passwordInput.root}"><input passwordInputInput autocomplete="new-password" minlength="8" class="${passwordInput.input}" />${visibilityTrigger("Show password")}</div>
                <p fieldDescription class="${field.description}">At least 8 characters.</p>
                <div *fieldError class="${field.error}">Enter a password of 8 characters or more.</div>
            </div>
            <div class="flex gap-2">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
            </div>
        </form>
        <pre fixtureOutput [values]="{ form: form() }"></pre>
    `,
})
export class PasswordInputField {
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
