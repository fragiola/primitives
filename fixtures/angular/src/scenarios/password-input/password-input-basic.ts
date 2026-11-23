import { Component, signal, ViewEncapsulation } from "@angular/core";
import type {
    PasswordInputVisibleChangeEvent,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/password-input";
import { passwordInput } from "examples-shared/recipes/password-input";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import {
    PASSWORD_INPUT_PARTS,
    visibilityTrigger,
} from "./password-input-parts.ts";

/** A password in a native form (spec/password-input.md, `/password-input/basic`). */
@Component({
    selector: "[scenario-password-input-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [PASSWORD_INPUT_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-4" (submit)="submit($event)">
            <label for="password" class="text-sm font-medium">Password</label>
            <div passwordInputRoot [id]="'password'" [name]="'password'" (valueChangeDetails)="valueChanged($event)" (visibleChangeDetails)="visibleChanged($event)" class="${passwordInput.root}"><input passwordInputInput autocomplete="current-password" class="${passwordInput.input}" />${visibilityTrigger("Show password")}</div>
            <div class="flex gap-2">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
            </div>
        </form>
        <pre fixtureOutput [values]="{ value: value(), visible: visible(), reason: reason(), form: form() }"></pre>
    `,
})
export class PasswordInputBasic {
    protected readonly value = signal<string | undefined>(undefined);
    protected readonly visible = signal<boolean | undefined>(undefined);
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly form = signal<string | undefined>(undefined);

    protected valueChanged(event: ValueChangeEvent<string>): void {
        this.value.set(event.value);
        this.reason.set(event.details.reason);
    }

    protected visibleChanged(event: PasswordInputVisibleChangeEvent): void {
        this.visible.set(event.visible);
        this.reason.set(event.details.reason);
    }

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
