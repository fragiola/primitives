import { Component, signal, ViewEncapsulation } from "@angular/core";
import { ListboxItem } from "@fragiola/primitives-angular/listbox";
import {
    type ListboxValue,
    ListboxVirtualRoot,
    ListboxVirtualRow,
} from "@fragiola/primitives-angular/listbox-virtual";
import { listbox } from "examples-shared/recipes/listbox";
import { Output } from "../../kit/output.ts";
import { ITEMS } from "./items.ts";

/** A multiple ListboxVirtual over the 10 000 items (spec/virtual-lists.md). */
@Component({
    selector: "[scenario-listbox-virtual-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [ListboxVirtualRoot, ListboxVirtualRow, ListboxItem, Output],
    template: `
        <div listboxVirtualRoot #list="listboxVirtualRoot" [multiple]="true" aria-label="Items" [items]="items" [value]="value()" (valueChange)="value.set(asValues($event))" [class]="styles.root + ' h-80'">@for (row of list.rows(); track row.index) {<div listboxItem [listboxVirtualRow]="row" [value]="row.item.value" [disabled]="!!row.item.disabled" [class]="styles.item">{{ row.item.label }}</div>}</div>
        <pre fixtureOutput [values]="{ count: value().length, last: value().at(-1) }"></pre>
    `,
})
export class ListboxVirtualBasic {
    protected readonly styles = listbox;
    protected readonly items = ITEMS;
    protected readonly value = signal<readonly string[]>([]);

    /** A multiple list's value: its values. */
    protected asValues(value: ListboxValue): readonly string[] {
        return value as readonly string[];
    }
}
