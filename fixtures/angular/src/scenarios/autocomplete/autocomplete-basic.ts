import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/autocomplete";
import { autocomplete } from "examples-shared/recipes/autocomplete";
import { Output } from "../../kit/output.ts";
import { AUTOCOMPLETE_PARTS } from "./autocomplete-parts.ts";
import { fruitPopup } from "./fruit-popup.ts";
import { asFruits, FRUITS } from "./suggestions.ts";

let count = 0;

@Component({
    selector: "[scenario-autocomplete-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [AUTOCOMPLETE_PARTS, Output],
    template: `
        <div class="flex flex-col items-start gap-2">
            <ng-container autocompleteRoot [items]="fruits" [(value)]="value" (valueChangeDetails)="onValue($event)" [(open)]="open" (openChangeDetails)="reason.set($event.details.reason)">
                <div class="flex flex-col gap-1">
                    <label [attr.for]="id" class="text-sm font-medium">Search</label>
                    <div autocompleteInputGroup [class]="styles['input-group']">
                        <input autocompleteInput [id]="id" [class]="styles.input" />
                        <button *autocompleteClear aria-label="Clear search" [class]="styles.clear">×</button>
                        <button autocompleteTrigger aria-label="Show suggestions" [class]="styles.trigger">▾</button>
                    </div>
                </div>
                ${fruitPopup()}
            </ng-container>
            <button type="button">After</button>
        </div>
        <pre fixtureOutput [values]="{ value: value(), open: open(), reason: reason() }"></pre>
    `,
})
export class AutocompleteBasic {
    protected readonly asFruits = asFruits;
    protected readonly styles = autocomplete;
    protected readonly id = `autocomplete-basic-${++count}`;
    protected readonly fruits = FRUITS;
    protected readonly value = signal("");
    protected readonly open = signal(false);
    protected readonly reason = signal<string | undefined>(undefined);

    protected onValue(event: ValueChangeEvent<string>): void {
        this.reason.set(event.details.reason);
    }
}
