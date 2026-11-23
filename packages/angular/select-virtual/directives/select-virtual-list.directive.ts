import {
    afterRenderEffect,
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
    numberAttribute,
    output,
    untracked,
} from "@angular/core";
import { createVirtualizer } from "@fragiola/primitives/virtual";
import {
    injectHost,
    injectVirtualRows,
    type VirtualItemSize,
    type VirtualRowData,
} from "@fragiola/primitives-angular/internal";
import {
    type SelectItemData,
    SelectList,
    SelectRoot,
} from "@fragiola/primitives-angular/select";

/**
 * Select's List rendering only the Root's `items` in view (spec/virtual-lists.md): it is a
 * `[selectList]` (a host directive), whose template renders `rows()` (`exportAs`), each a
 * `[selectItem]` with the `[selectVirtualRow]` bound to its row:
 * `<div selectVirtualList #list="selectVirtualList">` around
 * `@for (row of list.rows(); track row.index) { <div selectItem [selectVirtualRow]="row" [value]="row.item.value">...</div> }`.
 * The highlighted and selected items stay rendered, so `aria-activedescendant` names a rendered
 * option.
 */
@Directive({
    selector: "[selectVirtualList]",
    exportAs: "selectVirtualList",
    hostDirectives: [SelectList],
    host: {
        "[attr.aria-busy]": "loading() ? 'true' : null",
        "[attr.data-loading]": "loading() ? '' : null",
    },
})
export class SelectVirtualList {
    /** A row's size in pixels before it is measured, or every row's with `measure` false. */
    readonly itemSize = input<VirtualItemSize>(36);
    /** Measure the rendered rows (default `true`); `false`: fixed sizes. */
    readonly measure = input(true, { transform: booleanAttribute });
    /** The rows rendered beyond each end of the view (default 4). */
    readonly overscan = input(4, { transform: numberAttribute });
    /** The list is loading (`data-loading`, `aria-busy`). */
    readonly loading = input(false, { transform: booleanAttribute });
    /** The last row came into view while not `loading`: load the next page. */
    readonly loadMore = output<void>();

    private readonly root = inject(SelectRoot);
    /** The virtualizer and its rows, for the row directive. */
    readonly virtual = injectVirtualRows({
        createVirtualizer,
        host: injectHost(),
        items: () => this.root.itemList(),
        pinned: () => {
            const highlighted = this.root.highlighted();
            const value = this.root.selected();
            return this.root
                .itemList()
                .flatMap((item, index) =>
                    item.value === highlighted || item.value === value
                        ? [index]
                        : [],
                );
        },
        itemSize: this.itemSize,
        measure: this.measure,
        overscan: this.overscan,
        loading: this.loading,
        loadMore: () => this.loadMore.emit(),
    });
    /** The rows to render: `@for (row of list.rows(); track row.index)`. */
    readonly rows: () => readonly VirtualRowData<SelectItemData>[] =
        this.virtual.rows;

    constructor() {
        const root = this.root;
        const active = computed(() => {
            const highlighted = root.highlighted();
            return root
                .itemList()
                .findIndex((item) => item.value === highlighted);
        });
        // the highlighted row in view, by its offset: after the Item's own scroll (its effect runs
        // in an earlier phase, again once the popup is placed), which reads boxes a popup's
        // opening scale transforms
        afterRenderEffect({
            read: () => {
                const index = active();
                root.overlay.positioner();
                if (index >= 0) {
                    untracked(() =>
                        this.virtual.virtualizer.scrollToIndex(index),
                    );
                }
            },
        });
    }
}
