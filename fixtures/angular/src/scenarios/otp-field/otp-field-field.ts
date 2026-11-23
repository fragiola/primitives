import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    OTPFieldInput,
    OTPFieldRoot,
} from "@fragiola/primitives-angular/otp-field";
import { field } from "examples-shared/recipes/field";
import { otpField } from "examples-shared/recipes/otp-field";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";
import { OtpOutput } from "./otp-output.ts";

/** spec/otp-field.md, `/otp-field/field`: a masked, alphanumeric, required code in a Field. */
@Component({
    selector: "[scenario-otp-field-field]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, OTPFieldRoot, OTPFieldInput, Output],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <div fieldRoot [name]="'otp'" [class]="fieldStyles.root">
                <label fieldLabel [class]="fieldStyles.label">Sign-in code</label>
                <div otpFieldRoot [length]="4" [required]="true" [validationType]="'alphanumeric'" [mask]="true" (valueChangeDetails)="output.changed($event)" (valueComplete)="output.completed($event)" (valueInvalid)="output.refused($event)" [class]="styles.root">
                    @for (slot of slots; track slot) {
                        <input otpFieldInput [attr.aria-label]="'Character ' + slot + ' of 4'" [class]="styles.input" />
                    }
                </div>
                <p fieldDescription [class]="fieldStyles.description">Check your email.</p>
                <div *fieldError [class]="fieldStyles.error">Enter the 4-character code.</div>
            </div>
            <button type="submit">Submit</button>
        </form>
        <pre fixtureOutput [values]="{ value: output.value(), reason: output.reason(), complete: output.complete(), invalid: output.invalid(), form: form() }"></pre>
    `,
})
export class OtpFieldField {
    protected readonly styles = otpField;
    protected readonly fieldStyles = field;
    protected readonly slots = [1, 2, 3, 4];
    protected readonly output = new OtpOutput();
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
