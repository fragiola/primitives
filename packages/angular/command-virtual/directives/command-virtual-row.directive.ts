import { Directive, inject, input } from "@angular/core";
import {
    bindVirtualRow,
    injectHost,
    type VirtualRowData,
} from "@fragiola/primitives-angular/internal";
import { CommandVirtualList } from "./command-virtual-list.directive.ts";

/**
 * A rendered row of a `[commandVirtualList]`, on its `[commandItem]` (spec/command.md): its
 * place in the set (`aria-setsize`, `aria-posinset`, `data-index`), its room as margins, the
 * structural style of a row (`flex-shrink: 0`, `overflow-anchor: none`), and its measurement:
 * `<div commandItem [commandVirtualRow]="row" [value]="row.item.value">`.
 */
@Directive({
    selector: "[commandVirtualRow]",
    exportAs: "commandVirtualRow",
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
export class CommandVirtualRow {
    /** The row it renders, from the List's `rows()`. */
    readonly row = input.required<VirtualRowData<unknown>>({
        alias: "commandVirtualRow",
    });

    constructor() {
        bindVirtualRow(
            inject(CommandVirtualList).virtual,
            this.row,
            injectHost(),
        );
    }
}
