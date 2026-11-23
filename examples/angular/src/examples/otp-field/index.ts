import { Component, signal } from "@angular/core";
import { Label } from "@fragiola/primitives-angular/label";
import {
    OTPFieldInput,
    OTPFieldRoot,
} from "@fragiola/primitives-angular/otp-field";
import { styles } from "./styles.ts";

// A sign-in code: six slots, one digit each, named by their position. Typing moves forward,
// Backspace moves back, a paste fills every slot, and the browser's one-time-code autofill
// reaches the first one; the complete code is reported (spec/otp-field.md).
@Component({
    selector: "example-sign-in-code",
    imports: [Label, OTPFieldRoot, OTPFieldInput],
    template: `
        <div [class]="styles.stack">
            <label label id="sign-in-label" for="sign-in" [class]="styles.label">Sign-in code</label>
            <div otpFieldRoot [id]="'sign-in'" [length]="6" aria-labelledby="sign-in-label" (valueChange)="code.set(null)" (valueComplete)="code.set($event.value)" [class]="styles.root">
                @for (slot of slots; track slot) {
                    <input otpFieldInput [attr.aria-label]="'Digit ' + slot + ' of 6'" [class]="styles.input" />
                }
            </div>
            <p [class]="styles.status" aria-live="polite">{{ code() === null ? "Enter the code we sent you." : "Code " + code() + " entered." }}</p>
        </div>
    `,
})
export default class SignInCode {
    protected readonly styles = styles;
    protected readonly slots = [1, 2, 3, 4, 5, 6];
    protected readonly code = signal<string | null>(null);
}
