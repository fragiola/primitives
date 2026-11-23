import { Component, signal, ViewEncapsulation } from "@angular/core";
import { passwordInput } from "examples-shared/recipes/password-input";
import { Output } from "../../kit/output.ts";
import {
    PASSWORD_INPUT_PARTS,
    visibilityTrigger,
} from "./password-input-parts.ts";

/** A disabled and a read-only PasswordInput (spec/password-input.md, `/password-input/states`). */
@Component({
    selector: "[scenario-password-input-states]",
    encapsulation: ViewEncapsulation.None,
    imports: [PASSWORD_INPUT_PARTS, Output],
    template: `
        <div class="flex flex-col items-start gap-4">
            <label for="pin" class="text-sm font-medium">PIN</label>
            <div passwordInputRoot [id]="'pin'" [disabled]="true" [defaultValue]="'1234'" (visibleChange)="visible.set($event)" class="${passwordInput.root}"><input passwordInputInput class="${passwordInput.input}" />${visibilityTrigger("Show PIN")}</div>
            <label for="recovery" class="text-sm font-medium">Recovery key</label>
            <div passwordInputRoot [id]="'recovery'" [readOnly]="true" [defaultVisible]="true" [defaultValue]="'abcd-efgh'" (visibleChange)="visible.set($event)" class="${passwordInput.root}"><input passwordInputInput class="${passwordInput.input}" />${visibilityTrigger("Show recovery key")}</div>
        </div>
        <pre fixtureOutput [values]="{ visible: visible() }"></pre>
    `,
})
export class PasswordInputStates {
    protected readonly visible = signal<boolean | undefined>(undefined);
}
