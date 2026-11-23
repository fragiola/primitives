import { Directive, signal } from "@angular/core";
import type {
    ListboxValue,
    SelectionBehavior,
} from "@fragiola/primitives-angular/listbox";
import { listbox } from "examples-shared/recipes/listbox";
import { listboxOptions } from "./listbox-parts.ts";
import { printValue, TOPPINGS } from "./options.ts";

/** The template of `/listbox/multiple` and `/listbox/replace` (spec/listbox.md). */
export const TOPPINGS_TEMPLATE = `
    <div class="flex flex-col items-start gap-2">
        <h2 id="toppings" class="text-sm font-semibold">Toppings</h2>
        <div listboxRoot aria-labelledby="toppings" [multiple]="true" [selectionBehavior]="selectionBehavior" [value]="value()" (valueChange)="value.set($event)" [class]="styles.root">${listboxOptions("toppings")}</div>
    </div>
    <pre fixtureOutput [values]="{ value: print(value()) }"></pre>
`;

/** The state of the toppings scenarios. */
@Directive()
export abstract class ToppingsListbox {
    protected abstract readonly selectionBehavior: SelectionBehavior;
    protected readonly styles = listbox;
    protected readonly toppings = TOPPINGS;
    protected readonly print = printValue;
    protected readonly value = signal<ListboxValue>([]);
}
