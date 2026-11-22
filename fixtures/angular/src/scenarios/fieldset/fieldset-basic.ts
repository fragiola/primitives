import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    FieldsetLegend,
    FieldsetRoot,
} from "@fragiola/primitives-angular/fieldset";
import { field } from "examples-shared/recipes/field";
import { fieldset } from "examples-shared/recipes/fieldset";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";

/** Two fieldsets, the second disabled with a nested one (spec/fieldset.md). */
@Component({
    selector: "[scenario-fieldset-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [FieldsetRoot, FieldsetLegend, FIELD_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-4" (submit)="submit($event)">
            <fieldset fieldsetRoot [class]="styles.root">
                <div fieldsetLegend [class]="styles.legend">Shipping address</div>
                <div fieldRoot [name]="'street'" [class]="fieldStyles.root">
                    <label fieldLabel [class]="fieldStyles.label">Street</label>
                    <input fieldControl [class]="fieldStyles.control" />
                </div>
                <div fieldRoot [name]="'city'" [class]="fieldStyles.root">
                    <label fieldLabel [class]="fieldStyles.label">City</label>
                    <input fieldControl [class]="fieldStyles.control" />
                </div>
            </fieldset>
            <fieldset fieldsetRoot [disabled]="true" [class]="styles.root">
                <div fieldsetLegend [class]="styles.legend">Billing address</div>
                <div fieldRoot [name]="'billing-street'" [class]="fieldStyles.root">
                    <label fieldLabel [class]="fieldStyles.label">Billing street</label>
                    <input fieldControl [class]="fieldStyles.control" />
                </div>
                <fieldset fieldsetRoot [class]="styles.root">
                    <div fieldsetLegend [class]="styles.legend">Billing contact</div>
                    <div fieldRoot [name]="'phone'" [class]="fieldStyles.root">
                        <label fieldLabel [class]="fieldStyles.label">Phone</label>
                        <input fieldControl [class]="fieldStyles.control" />
                    </div>
                </fieldset>
            </fieldset>
            <button type="submit">Submit</button>
        </form>
        <pre fixtureOutput [values]="{ form: form() }"></pre>
    `,
})
export class FieldsetBasic {
    protected readonly styles = fieldset;
    protected readonly fieldStyles = field;
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
