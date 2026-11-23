import { Component, signal, ViewEncapsulation } from "@angular/core";
import { autocomplete } from "examples-shared/recipes/autocomplete";
import { Output } from "../../kit/output.ts";
import { AUTOCOMPLETE_PARTS } from "./autocomplete-parts.ts";
import { fruitPopup } from "./fruit-popup.ts";
import { asFruits, FRUITS } from "./suggestions.ts";

let count = 0;

@Component({
    selector: "[scenario-autocomplete-none]",
    encapsulation: ViewEncapsulation.None,
    imports: [AUTOCOMPLETE_PARTS, Output],
    template: `
        <ng-container autocompleteRoot mode="none" [items]="fruits" openOnInputClick autoHighlight [(value)]="value" (openChangeDetails)="reason.set($event.details.reason)">
            <div class="flex flex-col gap-1">
                <label [attr.for]="id" class="text-sm font-medium">Fruit</label>
                <div autocompleteInputGroup [class]="styles['input-group']">
                    <input autocompleteInput [id]="id" [class]="styles.input" />
                    <button autocompleteTrigger aria-label="Show suggestions" [class]="styles.trigger">▾</button>
                </div>
            </div>
            ${fruitPopup(null)}
        </ng-container>
        <pre fixtureOutput [values]="{ value: value(), reason: reason() }"></pre>
    `,
})
export class AutocompleteNone {
    protected readonly asFruits = asFruits;
    protected readonly styles = autocomplete;
    protected readonly id = `autocomplete-none-${++count}`;
    protected readonly fruits = FRUITS;
    protected readonly value = signal("");
    protected readonly reason = signal<string | undefined>(undefined);
}
