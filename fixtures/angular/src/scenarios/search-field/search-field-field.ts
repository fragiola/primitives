import { Component, signal, ViewEncapsulation } from "@angular/core";
import { field } from "examples-shared/recipes/field";
import { searchField } from "examples-shared/recipes/search-field";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";
import {
    clearButton,
    SEARCH_FIELD_PARTS,
    SEARCH_ICON,
} from "./search-field-parts.ts";

/** A required SearchField in a Field (spec/search-field.md, `/search-field/field`). */
@Component({
    selector: "[scenario-search-field-field]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, SEARCH_FIELD_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-4" (submit)="submit($event)">
            <div fieldRoot class="${field.root}">
                <label fieldLabel class="${field.label}">City</label>
                <div searchFieldRoot [required]="true" [name]="'city'" class="${searchField.root}">${SEARCH_ICON}<input searchFieldInput class="${searchField.input}" />${clearButton("Clear city")}</div>
                <p fieldDescription class="${field.description}">Where to look.</p>
                <div *fieldError class="${field.error}">Enter a city.</div>
            </div>
            <div class="flex gap-2">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
            </div>
        </form>
        <pre fixtureOutput [values]="{ form: form() }"></pre>
    `,
})
export class SearchFieldField {
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
