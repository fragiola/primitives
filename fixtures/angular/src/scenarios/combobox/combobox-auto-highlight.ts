import { Component, signal, ViewEncapsulation } from "@angular/core";
import { combobox } from "examples-shared/recipes/combobox";
import { Output } from "../../kit/output.ts";
import { COMBOBOX_PARTS } from "./combobox-parts.ts";
import { FRUIT_POPUP } from "./fruit-combobox.ts";
import { asFruits, FRUITS, type Fruit, printValues } from "./fruits.ts";

let count = 0;

/** spec/combobox.md, `/combobox/auto-highlight`: typing highlights the first match. */
@Component({
    selector: "[scenario-combobox-auto-highlight]",
    encapsulation: ViewEncapsulation.None,
    imports: [COMBOBOX_PARTS, Output],
    template: `
        <ng-container comboboxRoot [items]="fruits" autoHighlight [(value)]="value">
            <div class="flex flex-col gap-1">
                <label [attr.for]="id" class="text-sm font-medium">Fruit</label>
                <div comboboxInputGroup [class]="styles['input-group']">
                    <input comboboxInput [id]="id" [class]="styles.input" />
                </div>
            </div>
            ${FRUIT_POPUP}
        </ng-container>
        <pre fixtureOutput [values]="{ value: print(value()) }"></pre>
    `,
})
export class ComboboxAutoHighlight {
    protected readonly asFruits = asFruits;
    protected readonly styles = combobox;
    protected readonly id = `combobox-auto-highlight-${++count}`;
    protected readonly fruits = FRUITS;
    protected readonly print = printValues;
    protected readonly value = signal<Fruit | null>(null);
}
