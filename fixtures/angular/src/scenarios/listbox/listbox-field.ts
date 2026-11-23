import { Component, signal, ViewEncapsulation } from "@angular/core";
import { field } from "examples-shared/recipes/field";
import { listbox } from "examples-shared/recipes/listbox";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";
import { LISTBOX_PARTS, listboxOptions } from "./listbox-parts.ts";
import { FRUITS, TOPPINGS } from "./options.ts";

/** A required list in a Field, and a multiple one in the same form (spec/listbox.md). */
@Component({
    selector: "[scenario-listbox-field]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, LISTBOX_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-4" (submit)="submit($event)">
            <div fieldRoot [name]="'fruit'" [class]="fieldStyles.root">
                <label fieldLabel [class]="fieldStyles.label">Fruit</label>
                <div listboxRoot [required]="true" [class]="styles.root">${listboxOptions("fruits")}</div>
                <p fieldDescription [class]="fieldStyles.description">Pick one.</p>
                <div *fieldError [class]="fieldStyles.error">Choose a fruit.</div>
            </div>
            <div class="flex flex-col items-start gap-2">
                <h2 id="toppings" class="text-sm font-semibold">Toppings</h2>
                <div listboxRoot aria-labelledby="toppings" [multiple]="true" [name]="'toppings'" [defaultValue]="['cheese']" [class]="styles.root">${listboxOptions("toppings")}</div>
            </div>
            <div class="flex gap-2">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
            </div>
        </form>
        <pre fixtureOutput [values]="{ form: form() }"></pre>
    `,
})
export class ListboxField {
    protected readonly styles = listbox;
    protected readonly fieldStyles = field;
    protected readonly fruits = FRUITS;
    protected readonly toppings = TOPPINGS;
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
