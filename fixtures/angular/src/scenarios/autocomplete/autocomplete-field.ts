import { Component, signal, ViewEncapsulation } from "@angular/core";
import { autocomplete } from "examples-shared/recipes/autocomplete";
import { field } from "examples-shared/recipes/field";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";
import { AUTOCOMPLETE_PARTS } from "./autocomplete-parts.ts";
import { CITY_POPUP } from "./fruit-popup.ts";
import { asCities, CITIES } from "./suggestions.ts";

/** The autocomplete inside a Field: labelled, described and validated by it. */
@Component({
    selector: "[scenario-autocomplete-field]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, AUTOCOMPLETE_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-4" (submit)="submit($event)">
            <div fieldRoot [name]="'city'" [class]="fieldStyles.root">
                <label fieldLabel [class]="fieldStyles.label">City</label>
                <ng-container autocompleteRoot [items]="cities" required>
                    <div autocompleteInputGroup [class]="styles['input-group']">
                        <input autocompleteInput [class]="styles.input" />
                    </div>
                    ${CITY_POPUP}
                </ng-container>
                <p fieldDescription [class]="fieldStyles.description">Type or pick one.</p>
                <div *fieldError [class]="fieldStyles.error">Enter a city.</div>
            </div>
            <div class="flex gap-2">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
            </div>
        </form>
        <pre fixtureOutput [values]="{ form: form() }"></pre>
    `,
})
export class AutocompleteField {
    protected readonly asCities = asCities;
    protected readonly styles = autocomplete;
    protected readonly fieldStyles = field;
    protected readonly cities = CITIES;
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
