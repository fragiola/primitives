import { Component, signal, ViewEncapsulation } from "@angular/core";
import { Label } from "@fragiola/primitives-angular/label";
import {
    OTPFieldInput,
    OTPFieldRoot,
} from "@fragiola/primitives-angular/otp-field";
import { label } from "examples-shared/recipes/label";
import { otpField } from "examples-shared/recipes/otp-field";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { OtpOutput } from "./otp-output.ts";

/** spec/otp-field.md, `/otp-field/basic` (and `?dir=rtl`): a code in a form, a read-only and a disabled one. */
@Component({
    selector: "[scenario-otp-field-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [Label, OTPFieldRoot, OTPFieldInput, Output],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <label label id="code-label" for="code" [class]="labelStyles.root">Verification code</label>
            <div otpFieldRoot [id]="'code'" [name]="'code'" [length]="6" aria-labelledby="code-label" (valueChangeDetails)="output.changed($event)" (valueComplete)="output.completed($event)" (valueInvalid)="output.refused($event)" [class]="styles.root">
                @for (slot of six; track slot) {
                    <input otpFieldInput [attr.aria-label]="'Digit ' + slot + ' of 6'" [class]="styles.input" />
                }
            </div>
            <div class="flex gap-2">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
            </div>
        </form>
        <div class="mt-4 flex flex-col items-start gap-2">
            <div otpFieldRoot aria-label="Backup code" [length]="4" [readOnly]="true" [defaultValue]="'2468'" [class]="styles.root">
                @for (slot of four; track slot) {
                    <input otpFieldInput [attr.aria-label]="'Backup digit ' + slot + ' of 4'" [class]="styles.input" />
                }
            </div>
            <div otpFieldRoot aria-label="Old code" [length]="4" [disabled]="true" [class]="styles.root">
                @for (slot of four; track slot) {
                    <input otpFieldInput [attr.aria-label]="'Old digit ' + slot + ' of 4'" [class]="styles.input" />
                }
            </div>
        </div>
        <pre fixtureOutput [values]="{ value: output.value(), reason: output.reason(), complete: output.complete(), invalid: output.invalid(), form: form() }"></pre>
    `,
})
export class OtpFieldBasic {
    protected readonly styles = otpField;
    protected readonly labelStyles = label;
    protected readonly six = [1, 2, 3, 4, 5, 6];
    protected readonly four = [1, 2, 3, 4];
    protected readonly output = new OtpOutput();
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
