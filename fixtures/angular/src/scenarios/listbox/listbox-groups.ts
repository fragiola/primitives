import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { ListboxValue } from "@fragiola/primitives-angular/listbox";
import { listbox } from "examples-shared/recipes/listbox";
import { Output } from "../../kit/output.ts";
import { LISTBOX_PARTS, listboxOptions } from "./listbox-parts.ts";
import { PRODUCE, printValue } from "./options.ts";

@Component({
    selector: "[scenario-listbox-groups]",
    encapsulation: ViewEncapsulation.None,
    imports: [LISTBOX_PARTS, Output],
    template: `
        <div class="flex flex-col items-start gap-2">
            <h2 id="produce" class="text-sm font-semibold">Produce</h2>
            <div listboxRoot aria-labelledby="produce" (valueChange)="value.set($event)" [class]="styles.root">@for (group of produce; track group.label; let index = $index) {@if (index > 0) {<div listboxSeparator [class]="styles.separator"></div>}<div listboxGroup [class]="styles.group"><div listboxGroupLabel [class]="styles['group-label']">{{ group.label }}</div>${listboxOptions("group.items")}</div>}</div>
        </div>
        <pre fixtureOutput [values]="{ value: print(value()) }"></pre>
    `,
})
export class ListboxGroups {
    protected readonly styles = listbox;
    protected readonly produce = PRODUCE;
    protected readonly print = printValue;
    protected readonly value = signal<ListboxValue>(null);
}
