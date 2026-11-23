import { Component, signal } from "@angular/core";
import {
    PasswordInputInput,
    PasswordInputRoot,
    PasswordInputVisibilityTrigger,
} from "@fragiola/primitives-angular/password-input";
import { styles } from "./styles.ts";

// A sign-in form (spec/password-input.md): the eye button shows and hides the password, keeping
// the focus and the caret in the field; signing in hides it again before the form is read.
@Component({
    selector: "example-sign-in-form",
    imports: [
        PasswordInputRoot,
        PasswordInputInput,
        PasswordInputVisibilityTrigger,
    ],
    template: `
        <form [class]="styles.form" (submit)="signIn($event)">
            <label for="email" [class]="styles.label">Email</label>
            <input id="email" name="email" type="email" autocomplete="username" value="ada@example.com" [class]="styles.email" />
            <label for="password" [class]="styles.label">Password</label>
            <div passwordInputRoot [id]="'password'" [name]="'password'" [required]="true" [class]="styles.root">
                <input passwordInputInput autocomplete="current-password" [class]="styles.input" />
                <button passwordInputVisibilityTrigger aria-label="Show password" [class]="styles.visibilityTrigger">
                    <svg [class]="styles.show" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                    <svg [class]="styles.hide" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                        <path d="M3 3l18 18" />
                    </svg>
                </button>
            </div>
            <button type="submit" [class]="styles.submit">Sign in</button>
            <p role="status" [class]="styles.status">{{ status() }}</p>
        </form>
    `,
})
export default class SignInForm {
    protected readonly styles = styles;
    protected readonly status = signal("");

    protected signIn(event: Event): void {
        event.preventDefault();
        const data = new FormData(event.target as HTMLFormElement);
        this.status.set(`Signed in as ${String(data.get("email"))}.`);
    }
}
