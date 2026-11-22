import { Component } from "@angular/core";
import {
    FieldControl,
    FieldDescription,
    FieldError,
    FieldLabel,
    FieldRoot,
} from "@fragiola/primitives-angular/field";
import { styles } from "./styles.ts";

// A sign-up email: the label names the input, the description describes it, and "Sign up" with
// an empty or malformed address shows the matching error and focuses the input (spec/field.md).
@Component({
    selector: "example-sign-up-email",
    imports: [
        FieldRoot,
        FieldLabel,
        FieldControl,
        FieldDescription,
        FieldError,
    ],
    template: `
        <form [class]="styles.form" (submit)="$event.preventDefault()">
            <div fieldRoot [name]="'email'" [class]="styles.root">
                <label fieldLabel [class]="styles.label">Email</label>
                <input fieldControl type="email" required [class]="styles.control" />
                <p fieldDescription [class]="styles.description">We never share it.</p>
                <div *fieldError="'valueMissing'" [class]="styles.error">Enter your email.</div>
                <div *fieldError="'typeMismatch'" [class]="styles.error">Enter a valid email.</div>
            </div>
            <button type="submit" [class]="styles.submit">Sign up</button>
        </form>
    `,
})
export default class SignUpEmail {
    protected readonly styles = styles;
}
