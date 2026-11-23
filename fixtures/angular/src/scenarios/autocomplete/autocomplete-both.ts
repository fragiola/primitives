import { Component, signal, ViewEncapsulation } from "@angular/core";
import { autocomplete } from "examples-shared/recipes/autocomplete";
import { Output } from "../../kit/output.ts";
import { AUTOCOMPLETE_PARTS } from "./autocomplete-parts.ts";
import { fruitPopup } from "./fruit-popup.ts";
import { asFruits, FRUITS } from "./suggestions.ts";

let count = 0;

@Component({
    selector: "[scenario-autocomplete-both]",
    encapsulation: ViewEncapsulation.None,
    imports: [AUTOCOMPLETE_PARTS, Output],
    template: `
        <div class="flex flex-col items-start gap-2">
            <ng-container autocompleteRoot mode="both" [items]="fruits" [(value)]="value" (valueChangeDetails)="reason.set($event.details.reason)">
                <div class="flex flex-col gap-1">
                    <label [attr.for]="id" class="text-sm font-medium">Fruit</label>
                    <div autocompleteInputGroup [class]="styles['input-group']">
                        <input autocompleteInput [id]="id" [class]="styles.input" />
                    </div>
                </div>
                ${fruitPopup()}
            </ng-container>
            <button type="button">After</button>
        </div>
        <pre fixtureOutput [values]="{ value: value(), reason: reason() }"></pre>
    `,
})
export class AutocompleteBoth {
    protected readonly asFruits = asFruits;
    protected readonly styles = autocomplete;
    protected readonly id = `autocomplete-both-${++count}`;
    protected readonly fruits = FRUITS;
    protected readonly value = signal("");
    protected readonly reason = signal<string | undefined>(undefined);
}
