import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    CheckboxIndicator,
    CheckboxRoot,
} from "@fragiola/primitives-angular/checkbox";
import { checkbox } from "examples-shared/recipes/checkbox";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";

/**
 * spec/checkbox.md, `/checkbox/controlled-form`: always checked, every change ignored (no render
 * follows a refused reset).
 */
@Component({
    selector: "[scenario-checkbox-controlled-form]",
    encapsulation: ViewEncapsulation.None,
    imports: [CheckboxRoot, CheckboxIndicator, Output],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <label class="flex items-center gap-2 text-sm"><button checkboxRoot #box="checkboxRoot" name="remember" [checked]="true" (checkedChange)="ignore()" [class]="styles.root"><span *checkboxIndicator [class]="styles.indicator">{{ box.state().indeterminate ? "–" : "✓" }}</span></button>Remember me</label>
            <div class="flex gap-2">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
            </div>
        </form>
        <pre fixtureOutput [values]="{ form: form() }"></pre>
    `,
})
export class CheckboxControlledForm {
    protected readonly styles = checkbox;
    protected readonly form = signal<string | undefined>(undefined);

    protected ignore(): void {}

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
