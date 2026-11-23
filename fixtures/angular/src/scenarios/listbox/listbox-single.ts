import { Component, signal, ViewEncapsulation } from "@angular/core";
import type {
    ListboxValue,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/listbox";
import { listbox } from "examples-shared/recipes/listbox";
import { Output } from "../../kit/output.ts";
import { LISTBOX_PARTS, listboxOptions } from "./listbox-parts.ts";
import { FRUITS, printValue } from "./options.ts";

@Component({
    selector: "[scenario-listbox-single]",
    encapsulation: ViewEncapsulation.None,
    imports: [LISTBOX_PARTS, Output],
    template: `
        <div class="flex flex-col items-start gap-2">
            <h2 id="fruit" class="text-sm font-semibold">Fruit</h2>
            <div listboxRoot aria-labelledby="fruit" [value]="value()" (valueChangeDetails)="change($event)" [class]="styles.root">${listboxOptions("fruits")}</div>
            <button type="button">After</button>
        </div>
        <pre fixtureOutput [values]="{ value: print(value()), reason: reason() }"></pre>
    `,
})
export class ListboxSingle {
    protected readonly styles = listbox;
    protected readonly fruits = FRUITS;
    protected readonly print = printValue;
    protected readonly value = signal<ListboxValue>(null);
    protected readonly reason = signal<string | undefined>(undefined);

    protected change(event: ValueChangeEvent<ListboxValue>): void {
        this.value.set(event.value);
        this.reason.set(event.details.reason);
    }
}
