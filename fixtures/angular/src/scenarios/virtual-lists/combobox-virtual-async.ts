import { Component, signal, ViewEncapsulation } from "@angular/core";
import { injectAsyncList } from "@fragiola/primitives-angular/async-list";
import {
    ComboboxInput,
    ComboboxInputGroup,
    ComboboxItem,
    ComboboxPopup,
    ComboboxPortal,
    ComboboxPositioner,
    ComboboxRoot,
    ComboboxStatus,
    ComboboxVirtualList,
    ComboboxVirtualRow,
} from "@fragiola/primitives-angular/combobox-virtual";
import { combobox } from "examples-shared/recipes/combobox";
import { Output } from "../../kit/output.ts";
import { loadItems, type VirtualItem } from "./items.ts";
import { asItem, SCROLL } from "./virtual-lists-parts.ts";

let count = 0;

/** A Combobox whose items load for its text, page by page (spec/virtual-lists.md). */
@Component({
    selector: "[scenario-combobox-virtual-async]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        ComboboxRoot,
        ComboboxInputGroup,
        ComboboxInput,
        ComboboxStatus,
        ComboboxPortal,
        ComboboxPositioner,
        ComboboxPopup,
        ComboboxVirtualList,
        ComboboxVirtualRow,
        ComboboxItem,
        Output,
    ],
    template: `
        <ng-container comboboxRoot [items]="list.items()" [filter]="null" [value]="value()" (valueChange)="value.set(asNullableItem($event))" (inputValueChange)="list.setFilterText($event)">
            <div class="flex flex-col gap-1">
                <label [attr.for]="id" class="text-sm font-medium">Item</label>
                <div comboboxInputGroup [class]="styles['input-group']">
                    <input comboboxInput [id]="id" [class]="styles.input" />
                </div>
                <div comboboxStatus [class]="styles.status">{{ list.loading() ? "Loading…" : "" }}</div>
            </div>
            <ng-container *comboboxPortal>
                <div comboboxPositioner [sideOffset]="4" [class]="styles.positioner">
                    <div comboboxPopup [class]="styles.popup">
                        <div comboboxVirtualList #virtual="comboboxVirtualList" [loading]="list.loading()" (loadMore)="list.loadMore()" [class]="styles.list + ' ' + scroll">@for (row of virtual.rows(); track row.index) {<div comboboxItem [comboboxVirtualRow]="row" [value]="row.item" [disabled]="!!asItem(row.item).disabled" [class]="styles.item">{{ asItem(row.item).label }}</div>}</div>
                    </div>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="{ count: list.items().length, filter: list.loading() ? undefined : list.filterText(), value: value()?.value }"></pre>
    `,
})
export class ComboboxVirtualAsync {
    protected readonly asItem = asItem;
    protected readonly styles = combobox;
    protected readonly scroll = SCROLL;
    protected readonly id = `combobox-virtual-async-${++count}`;
    protected readonly list = injectAsyncList({ load: loadItems });
    protected readonly value = signal<VirtualItem | null>(null);

    /** The chosen item, or none: the Combobox API types a value as `unknown`. */
    protected asNullableItem(value: unknown): VirtualItem | null {
        return (value ?? null) as VirtualItem | null;
    }
}
