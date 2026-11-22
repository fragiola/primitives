import { Component, signal, ViewEncapsulation } from "@angular/core";
import { Form, type FormErrors } from "@fragiola/primitives-angular/form";
import { field } from "examples-shared/recipes/field";
import { form } from "examples-shared/recipes/form";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";
import { validateWorkEmail } from "../field/validators.ts";

/** The keys of the errors left, as the scenario prints them (spec/form.md). */
const keys = (errors: FormErrors) => Object.keys(errors).join(",") || "empty";

/** A Form playing the server: errors a task after a submission, cleared on change (spec/form.md). */
@Component({
    selector: "[scenario-form-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [Form, FIELD_PARTS, Output],
    template: `
        <form formRoot aria-label="Sign up" [validationMode]="'onBlur'" [errors]="errors()" (clearErrors)="onClearErrors($event)" (submit)="submit($event)" [class]="formStyles.root">
            <div fieldRoot [name]="'email'" [validate]="validateWorkEmail" [class]="styles.root">
                <label fieldLabel [class]="styles.label">Email</label>
                <input fieldControl type="email" required [class]="styles.control" />
                <div *fieldError="'valueMissing'" [class]="styles.error">Enter your email.</div>
                <div *fieldError="'customError'" [class]="styles.error"></div>
            </div>
            <div fieldRoot [name]="'username'" [class]="styles.root">
                <label fieldLabel [class]="styles.label">Username</label>
                <input fieldControl [class]="styles.control" />
                <div *fieldError [class]="styles.error"></div>
            </div>
            <button type="submit">Submit</button>
        </form>
        <pre fixtureOutput [values]="{ form: form(), cleared: cleared() }"></pre>
    `,
})
export class FormBasic {
    protected readonly styles = field;
    protected readonly formStyles = form;
    protected readonly validateWorkEmail = validateWorkEmail;
    protected readonly errors = signal<FormErrors>({});
    protected readonly form = signal<string | undefined>(undefined);
    protected readonly cleared = signal<string | undefined>(undefined);

    protected onClearErrors(next: FormErrors): void {
        this.errors.set(next);
        this.cleared.set(keys(next));
    }

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        const target = event.currentTarget as HTMLFormElement;
        const data = new FormData(target);
        this.form.set(formEntries(target));
        // the server answers a task later
        setTimeout(() => {
            this.errors.set(
                data.get("username") === "admin"
                    ? { username: "This username is taken." }
                    : {},
            );
        });
    }
}
