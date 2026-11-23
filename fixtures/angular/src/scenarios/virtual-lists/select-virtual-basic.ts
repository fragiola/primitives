import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    SelectItem,
    SelectPopup,
    SelectPortal,
    SelectPositioner,
    SelectRoot,
    SelectTrigger,
    SelectValue,
    SelectVirtualList,
    SelectVirtualRow,
} from "@fragiola/primitives-angular/select-virtual";
import { select } from "examples-shared/recipes/select";
import { Output } from "../../kit/output.ts";
import { ITEMS } from "./items.ts";
import { SCROLL } from "./virtual-lists-parts.ts";

/** A Select over the 10 000 items, with a SelectVirtual List (spec/virtual-lists.md). */
@Component({
    selector: "[scenario-select-virtual-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        SelectRoot,
        SelectTrigger,
        SelectValue,
        SelectPortal,
        SelectPositioner,
        SelectPopup,
        SelectVirtualList,
        SelectVirtualRow,
        SelectItem,
        Output,
    ],
    template: `
        <ng-container selectRoot [items]="items" [value]="value()" (valueChange)="value.set($event)">
            <button selectTrigger aria-label="Item" [class]="styles.trigger"><span selectValue placeholder="Choose an item" [class]="styles.value"></span></button>
            <ng-container *selectPortal>
                <div selectPositioner [class]="styles.positioner">
                    <div selectPopup [class]="styles.popup">
                        <div selectVirtualList #list="selectVirtualList" [class]="styles.list + ' ' + scroll">@for (row of list.rows(); track row.index) {<div selectItem [selectVirtualRow]="row" [value]="row.item.value" [class]="styles.item">{{ row.item.label }}</div>}</div>
                    </div>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="{ value: value() }"></pre>
    `,
})
export class SelectVirtualBasic {
    protected readonly styles = select;
    protected readonly scroll = SCROLL;
    protected readonly items = ITEMS;
    protected readonly value = signal<string | null>(null);
}
