import { Component, signal } from "@angular/core";
import {
    FieldControl,
    FieldError,
    FieldLabel,
    FieldRoot,
} from "@fragiola/primitives-angular/field";
import { Form, type FormErrors } from "@fragiola/primitives-angular/form";
import { styles } from "./styles.ts";

// Create an account: the Form validates every field on submit and focuses the first invalid one.
// It plays the server too: the username `admin` is answered with an error on its field, which
// typing in that field clears (spec/form.md).
@Component({
    selector: "example-create-account",
    imports: [Form, FieldRoot, FieldLabel, FieldControl, FieldError],
    template: `
        <form formRoot aria-label="Create account" [errors]="errors()" (clearErrors)="errors.set($event)" (submit)="submit($event)" [class]="styles.form">
            <div fieldRoot [name]="'email'" [class]="styles.field.root">
                <label fieldLabel [class]="styles.field.label">Email</label>
                <input fieldControl type="email" required [class]="styles.field.control" />
                <div *fieldError="'valueMissing'" [class]="styles.field.error">Enter your email.</div>
                <div *fieldError="'typeMismatch'" [class]="styles.field.error">Enter a valid email.</div>
            </div>
            <div fieldRoot [name]="'username'" [class]="styles.field.root">
                <label fieldLabel [class]="styles.field.label">Username</label>
                <input fieldControl required [class]="styles.field.control" />
                <div *fieldError="'valueMissing'" [class]="styles.field.error">Choose a username.</div>
                @if (errors()["username"]) {
                    <div *fieldError [class]="styles.field.error"></div>
                }
            </div>
            <button type="submit" [class]="styles.submit">Create account</button>
            <p role="status" [class]="styles.status">{{ created() === null ? "" : "Account created for " + created() + "." }}</p>
        </form>
    `,
})
export default class CreateAccount {
    protected readonly styles = styles;
    protected readonly errors = signal<FormErrors>({});
    protected readonly created = signal<string | null>(null);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        const username = String(
            new FormData(event.target as HTMLFormElement).get("username"),
        );
        this.created.set(null);
        // the server's answer, a moment later
        setTimeout(() => {
            if (username === "admin") {
                this.errors.set({ username: "This username is taken." });
            } else {
                this.created.set(username);
            }
        });
    }
}
