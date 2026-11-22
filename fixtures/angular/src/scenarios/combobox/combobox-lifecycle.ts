import { Component, input, ViewEncapsulation } from "@angular/core";
import { combobox } from "examples-shared/recipes/combobox";
import { Lifecycle } from "../../kit/lifecycle.ts";
import { Output } from "../../kit/output.ts";
import { COMBOBOX_PARTS } from "./combobox-parts.ts";
import { FRUIT_POPUP_KEPT_MOUNTED } from "./fruit-combobox.ts";
import { asFruits, FRUITS } from "./fruits.ts";

let count = 0;

/** spec/README.md, "The lifecycle scenarios": the fruits' popup, kept mounted. */
@Component({
    selector: "[scenario-combobox-lifecycle]",
    encapsulation: ViewEncapsulation.None,
    imports: [COMBOBOX_PARTS, Output],
    template: `
        <ng-container comboboxRoot [items]="fruits" (openChangeDetails)="lifecycle.onOpenChange($event)" (openChangeComplete)="lifecycle.onOpenChangeComplete($event)">
            <div class="flex flex-col gap-1">
                <label [attr.for]="id" class="text-sm font-medium">Fruit</label>
                <div comboboxInputGroup [class]="styles['input-group']">
                    <input comboboxInput [id]="id" [class]="styles.input" />
                    <button comboboxTrigger aria-label="Show fruits" [class]="styles.trigger">▾</button>
                </div>
            </div>
            ${FRUIT_POPUP_KEPT_MOUNTED}
        </ng-container>
        <pre fixtureOutput [values]="lifecycle.values()"></pre>
    `,
})
export class ComboboxLifecycle {
    protected readonly asFruits = asFruits;
    protected readonly styles = combobox;
    protected readonly id = `combobox-lifecycle-${++count}`;
    protected readonly fruits = FRUITS;
    readonly cancel = input(false);
    protected readonly lifecycle = new Lifecycle(() => this.cancel());
}
