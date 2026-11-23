import { Directive, inject, input } from "@angular/core";
import {
    bindVirtualRow,
    injectHost,
    type VirtualRowData,
} from "@fragiola/primitives-angular/internal";
import { ListboxVirtualRoot } from "./listbox-virtual-root.directive.ts";

/**
 * A rendered row of a `[listboxVirtualRoot]`, on its `[listboxItem]` (spec/virtual-lists.md): its
 * place in the set (`aria-setsize`, `aria-posinset`, `data-index`), its room as margins, the
 * structural style of a row (`flex-shrink: 0`, `overflow-anchor: none`), and its measurement:
 * `<div listboxItem [listboxVirtualRow]="row" [value]="row.item.value">`.
 */
@Directive({
    selector: "[listboxVirtualRow]",
    exportAs: "listboxVirtualRow",
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
export class ListboxVirtualRow {
    /** The row it renders, from the Root's `rows()`. */
    readonly row = input.required<VirtualRowData<unknown>>({
        alias: "listboxVirtualRow",
    });

    constructor() {
        bindVirtualRow(
            inject(ListboxVirtualRoot).virtual,
            this.row,
            injectHost(),
        );
    }
}
