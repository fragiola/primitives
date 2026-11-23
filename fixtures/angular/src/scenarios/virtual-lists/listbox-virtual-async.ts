import { Component, ViewEncapsulation } from "@angular/core";
import { injectAsyncList } from "@fragiola/primitives-angular/async-list";
import { ListboxItem } from "@fragiola/primitives-angular/listbox";
import {
    ListboxVirtualRoot,
    ListboxVirtualRow,
} from "@fragiola/primitives-angular/listbox-virtual";
import { listbox } from "examples-shared/recipes/listbox";
import { Output } from "../../kit/output.ts";
import { loadItems } from "./items.ts";

/** A ListboxVirtual loading its pages as it scrolls (spec/virtual-lists.md). */
@Component({
    selector: "[scenario-listbox-virtual-async]",
    encapsulation: ViewEncapsulation.None,
    imports: [ListboxVirtualRoot, ListboxVirtualRow, ListboxItem, Output],
    template: `
        <div listboxVirtualRoot #virtual="listboxVirtualRoot" aria-label="Items" [items]="list.items()" [loading]="list.loading()" (loadMore)="list.loadMore()" [class]="styles.root + ' h-80'">@for (row of virtual.rows(); track row.index) {<div listboxItem [listboxVirtualRow]="row" [value]="row.item.value" [disabled]="!!row.item.disabled" [class]="styles.item">{{ row.item.label }}</div>}</div>
        <pre fixtureOutput [values]="{ count: list.items().length, status: list.status() }"></pre>
    `,
})
export class ListboxVirtualAsync {
    protected readonly styles = listbox;
    protected readonly list = injectAsyncList({ load: loadItems });
}
