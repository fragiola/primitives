import { Component, input, ViewEncapsulation } from "@angular/core";
import { autocomplete } from "examples-shared/recipes/autocomplete";
import { Lifecycle } from "../../kit/lifecycle.ts";
import { Output } from "../../kit/output.ts";
import { AUTOCOMPLETE_PARTS } from "./autocomplete-parts.ts";
import { fruitPopup } from "./fruit-popup.ts";
import { asFruits, FRUITS } from "./suggestions.ts";

let count = 0;

/** spec/README.md, "The lifecycle scenarios": the fruits' popup, kept mounted. */
@Component({
    selector: "[scenario-autocomplete-lifecycle]",
    encapsulation: ViewEncapsulation.None,
    imports: [AUTOCOMPLETE_PARTS, Output],
    template: `
        <ng-container autocompleteRoot [items]="fruits" (openChangeDetails)="lifecycle.onOpenChange($event)" (openChangeComplete)="lifecycle.onOpenChangeComplete($event)">
            <div class="flex flex-col gap-1">
                <label [attr.for]="id" class="text-sm font-medium">Fruit</label>
                <div autocompleteInputGroup [class]="styles['input-group']">
                    <input autocompleteInput [id]="id" [class]="styles.input" />
                    <button autocompleteTrigger aria-label="Show suggestions" [class]="styles.trigger">▾</button>
                </div>
            </div>
            ${fruitPopup("No suggestion.", true)}
        </ng-container>
        <pre fixtureOutput [values]="lifecycle.values()"></pre>
    `,
})
export class AutocompleteLifecycle {
    protected readonly asFruits = asFruits;
    protected readonly styles = autocomplete;
    protected readonly id = `autocomplete-lifecycle-${++count}`;
    protected readonly fruits = FRUITS;
    readonly cancel = input(false);
    protected readonly lifecycle = new Lifecycle(() => this.cancel());
}
