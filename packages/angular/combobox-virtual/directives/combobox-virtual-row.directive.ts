import { Directive, inject, input } from "@angular/core";
import {
    bindVirtualRow,
    injectHost,
    type VirtualRowData,
} from "@fragiola/primitives-angular/internal";
import { ComboboxVirtualList } from "./combobox-virtual-list.directive.ts";

/**
 * A rendered row of a `[comboboxVirtualList]`, on its `[comboboxItem]` (spec/virtual-lists.md): its
 * place in the set (`aria-setsize`, `aria-posinset`, `data-index`), its room as margins, the
 * structural style of a row (`flex-shrink: 0`, `overflow-anchor: none`), and its measurement:
 * `<div comboboxItem [comboboxVirtualRow]="row" [value]="row.item">`.
 */
@Directive({
    selector: "[comboboxVirtualRow]",
    exportAs: "comboboxVirtualRow",
    host: {
        "[attr.aria-setsize]": "row().setSize",
        "[attr.aria-posinset]": "row().index + 1",
        "[attr.data-index]": "row().index",
        "[style.flex-shrink]": "'0'",
        "[style.overflow-anchor]": "'none'",
        "[style.margin-block-start.px]": "row().spaceBefore",
        "[style.margin-block-end.px]": "row().spaceAfter",
    },
})
export class ComboboxVirtualRow {
    /** The row it renders, from the List's `rows()`. */
    readonly row = input.required<VirtualRowData<unknown>>({
        alias: "comboboxVirtualRow",
    });

    constructor() {
        bindVirtualRow(
            inject(ComboboxVirtualList).virtual,
            this.row,
            injectHost(),
        );
    }
}
