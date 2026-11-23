import { Component, signal, ViewEncapsulation } from "@angular/core";
import { searchField } from "examples-shared/recipes/search-field";
import { Output } from "../../kit/output.ts";
import {
    clearButton,
    SEARCH_FIELD_PARTS,
    SEARCH_ICON,
} from "./search-field-parts.ts";

/** A disabled and a read-only SearchField (spec/search-field.md, `/search-field/states`). */
@Component({
    selector: "[scenario-search-field-states]",
    encapsulation: ViewEncapsulation.None,
    imports: [SEARCH_FIELD_PARTS, Output],
    template: `
        <div class="flex flex-col items-start gap-4">
            <label for="disabled-search" class="text-sm font-medium">Disabled search</label>
            <div searchFieldRoot [id]="'disabled-search'" [disabled]="true" [defaultValue]="'chairs'" (valueChange)="value.set($event)" class="${searchField.root}">${SEARCH_ICON}<input searchFieldInput class="${searchField.input}" />${clearButton("Clear disabled search")}</div>
            <label for="saved-search" class="text-sm font-medium">Saved search</label>
            <div searchFieldRoot [id]="'saved-search'" [readOnly]="true" [defaultValue]="'tables'" (valueChange)="value.set($event)" class="${searchField.root}">${SEARCH_ICON}<input searchFieldInput class="${searchField.input}" />${clearButton("Clear saved search")}</div>
        </div>
        <pre fixtureOutput [values]="{ value: value() }"></pre>
    `,
})
export class SearchFieldStates {
    protected readonly value = signal<string | undefined>(undefined);
}
