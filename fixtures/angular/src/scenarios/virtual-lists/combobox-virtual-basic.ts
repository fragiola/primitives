import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    ComboboxEmpty,
    ComboboxInput,
    ComboboxInputGroup,
    ComboboxItem,
    ComboboxPopup,
    ComboboxPortal,
    ComboboxPositioner,
    ComboboxRoot,
    ComboboxVirtualList,
    ComboboxVirtualRow,
} from "@fragiola/primitives-angular/combobox-virtual";
import { combobox } from "examples-shared/recipes/combobox";
import { Output } from "../../kit/output.ts";
import { ITEMS, type VirtualItem } from "./items.ts";
import { asItem, SCROLL } from "./virtual-lists-parts.ts";

let count = 0;

/** A Combobox over the 10 000 items, with a ComboboxVirtual List (spec/virtual-lists.md). */
@Component({
    selector: "[scenario-combobox-virtual-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        ComboboxRoot,
        ComboboxInputGroup,
        ComboboxInput,
        ComboboxPortal,
        ComboboxPositioner,
        ComboboxPopup,
        ComboboxEmpty,
        ComboboxVirtualList,
        ComboboxVirtualRow,
        ComboboxItem,
        Output,
    ],
    template: `
        <ng-container comboboxRoot [items]="items" [value]="value()" (valueChange)="value.set(asNullableItem($event))" (inputValueChange)="input.set($event)">
            <div class="flex flex-col gap-1">
                <label [attr.for]="id" class="text-sm font-medium">Item</label>
                <div comboboxInputGroup [class]="styles['input-group']">
                    <input comboboxInput [id]="id" [class]="styles.input" />
                </div>
            </div>
            <ng-container *comboboxPortal>
                <div comboboxPositioner [sideOffset]="4" [class]="styles.positioner">
                    <div comboboxPopup [class]="styles.popup">
                        <div comboboxEmpty [class]="styles.empty">No item found.</div>
                        <div comboboxVirtualList #list="comboboxVirtualList" [class]="styles.list + ' ' + scroll">@for (row of list.rows(); track row.index) {<div comboboxItem [comboboxVirtualRow]="row" [value]="row.item" [disabled]="!!asItem(row.item).disabled" [class]="styles.item">{{ asItem(row.item).label }}</div>}</div>
                    </div>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="{ value: value()?.value, input: input() }"></pre>
    `,
})
export class ComboboxVirtualBasic {
    protected readonly asItem = asItem;
    protected readonly styles = combobox;
    protected readonly scroll = SCROLL;
    protected readonly id = `combobox-virtual-basic-${++count}`;
    protected readonly items = ITEMS;
    protected readonly value = signal<VirtualItem | null>(null);
    protected readonly input = signal("");

    /** The chosen item, or none: the Combobox API types a value as `unknown`. */
    protected asNullableItem(value: unknown): VirtualItem | null {
        return (value ?? null) as VirtualItem | null;
    }
}
