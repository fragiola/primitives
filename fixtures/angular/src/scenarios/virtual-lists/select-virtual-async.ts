import { Component, signal, ViewEncapsulation } from "@angular/core";
import { injectAsyncList } from "@fragiola/primitives-angular/async-list";
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
import { loadItems } from "./items.ts";
import { SCROLL } from "./virtual-lists-parts.ts";

/** A Select whose items load page by page (spec/virtual-lists.md). */
@Component({
    selector: "[scenario-select-virtual-async]",
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
        <ng-container selectRoot [items]="list.items()" [value]="value()" (valueChange)="value.set($event)">
            <button selectTrigger aria-label="Item" [class]="styles.trigger"><span selectValue placeholder="Choose an item" [class]="styles.value"></span></button>
            <ng-container *selectPortal>
                <div selectPositioner [class]="styles.positioner">
                    <div selectPopup [class]="styles.popup">
                        <div selectVirtualList #virtual="selectVirtualList" [loading]="list.loading()" (loadMore)="list.loadMore()" [class]="styles.list + ' ' + scroll">@for (row of virtual.rows(); track row.index) {<div selectItem [selectVirtualRow]="row" [value]="row.item.value" [class]="styles.item">{{ row.item.label }}</div>}</div>
                    </div>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="{ count: list.items().length, value: value() }"></pre>
    `,
})
export class SelectVirtualAsync {
    protected readonly styles = select;
    protected readonly scroll = SCROLL;
    protected readonly list = injectAsyncList({ load: loadItems });
    protected readonly value = signal<string | null>(null);
}
