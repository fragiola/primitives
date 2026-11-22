import { Component, signal } from "@angular/core";
import {
    CheckboxIndicator,
    CheckboxRoot,
} from "@fragiola/primitives-angular/checkbox";
import {
    FieldControl,
    FieldLabel,
    FieldRoot,
} from "@fragiola/primitives-angular/field";
import {
    FieldsetLegend,
    FieldsetRoot,
} from "@fragiola/primitives-angular/fieldset";
import { styles } from "./styles.ts";

/** What the form submits, as `key=value&...`. */
const entries = (form: HTMLFormElement) =>
    [...new FormData(form)]
        .map(([key, value]) => `${key}=${String(value)}`)
        .join("&");

// Shipping and billing: two fieldsets, each a group named by its legend. The billing one is
// disabled, with every field inside it, while billing is the same as shipping (spec/fieldset.md).
@Component({
    selector: "example-shipping-and-billing",
    imports: [
        FieldsetRoot,
        FieldsetLegend,
        FieldRoot,
        FieldLabel,
        FieldControl,
        CheckboxRoot,
        CheckboxIndicator,
    ],
    template: `
        <form [class]="styles.form" (submit)="submit($event)">
            <fieldset fieldsetRoot [class]="styles.fieldset.root">
                <div fieldsetLegend [class]="styles.fieldset.legend">Shipping address</div>
                <div fieldRoot [name]="'street'" [class]="styles.field.root">
                    <label fieldLabel [class]="styles.field.label">Street</label>
                    <input fieldControl [class]="styles.field.control" />
                </div>
                <div fieldRoot [name]="'city'" [class]="styles.field.root">
                    <label fieldLabel [class]="styles.field.label">City</label>
                    <input fieldControl [class]="styles.field.control" />
                </div>
            </fieldset>
            <label [class]="styles.row">
                <button checkboxRoot name="same" [(checked)]="same" [class]="styles.checkbox.root"><span *checkboxIndicator [class]="styles.checkbox.indicator"></span></button>
                Billing same as shipping
            </label>
            <fieldset fieldsetRoot [disabled]="same()" [class]="styles.fieldset.root">
                <div fieldsetLegend [class]="styles.fieldset.legend">Billing address</div>
                <div fieldRoot [name]="'billing-street'" [class]="styles.field.root">
                    <label fieldLabel [class]="styles.field.label">Billing street</label>
                    <input fieldControl [class]="styles.field.control" />
                </div>
                <div fieldRoot [name]="'billing-city'" [class]="styles.field.root">
                    <label fieldLabel [class]="styles.field.label">Billing city</label>
                    <input fieldControl [class]="styles.field.control" />
                </div>
            </fieldset>
            <button type="submit" [class]="styles.submit">Save</button>
            <p role="status" [class]="styles.status">{{ saved() === null ? "" : "Saved: " + saved() }}</p>
        </form>
    `,
})
export default class ShippingAndBilling {
    protected readonly styles = styles;
    protected readonly same = signal(true);
    protected readonly saved = signal<string | null>(null);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.saved.set(entries(event.target as HTMLFormElement));
    }
}
