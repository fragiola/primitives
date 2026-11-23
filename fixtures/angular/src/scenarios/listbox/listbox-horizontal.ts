import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { ListboxValue } from "@fragiola/primitives-angular/listbox";
import { listbox } from "examples-shared/recipes/listbox";
import { Output } from "../../kit/output.ts";
import { LISTBOX_PARTS, listboxOptions } from "./listbox-parts.ts";
import { printValue, SIZES } from "./options.ts";

@Component({
    selector: "[scenario-listbox-horizontal]",
    encapsulation: ViewEncapsulation.None,
    imports: [LISTBOX_PARTS, Output],
    template: `
        <div class="flex flex-col items-start gap-2">
            <h2 id="size" class="text-sm font-semibold">Size</h2>
            <div listboxRoot aria-labelledby="size" orientation="horizontal" [loopFocus]="false" defaultValue="m" (valueChange)="value.set($event)" [class]="styles.root">${listboxOptions("sizes")}</div>
        </div>
        <pre fixtureOutput [values]="{ value: print(value()) }"></pre>
    `,
})
export class ListboxHorizontal {
    protected readonly styles = listbox;
    protected readonly sizes = SIZES;
    protected readonly print = printValue;
    protected readonly value = signal<ListboxValue>("m");
}
