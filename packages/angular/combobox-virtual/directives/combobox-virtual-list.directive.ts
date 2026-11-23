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
    type ComboboxItemValue,
    ComboboxList,
    ComboboxRoot,
} from "@fragiola/primitives-angular/combobox";
import {
    injectHost,
    injectVirtualRows,
    reachableRows,
    type VirtualItemSize,
    type VirtualRowData,
    type VirtualRows,
} from "@fragiola/primitives-angular/internal";

/**
 * Combobox's List rendering only the matching items in view (spec/virtual-lists.md): it is a
 * `[comboboxList]` (a host directive), whose template renders `rows()` (`exportAs`) over the
 * matching entries of the Root's `items` (flat), each a `[comboboxItem]` with the
 * `[comboboxVirtualRow]` bound to its row:
 * `<div comboboxVirtualList #list="comboboxVirtualList">` around
 * `@for (row of list.rows(); track row.index) { <div comboboxItem [comboboxVirtualRow]="row" [value]="row.item">...</div> }`.
 * The ends, the highlighted item with its neighbours and the selected item stay rendered, so the
 * Input's keys and `aria-activedescendant` behave as with every item rendered.
 */
@Directive({
    selector: "[comboboxVirtualList]",
    exportAs: "comboboxVirtualList",
    hostDirectives: [ComboboxList],
    host: {
        "[attr.aria-busy]": "loading() ? 'true' : null",
        "[attr.data-loading]": "loading() ? '' : null",
    },
})
export class ComboboxVirtualList {
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

    private readonly root = inject(ComboboxRoot);
    private readonly selectedIndex = computed(() => {
        const root = this.root;
        return root.multiple()
            ? -1
            : root.entries().findIndex((entry) => root.isSelected(entry));
    });
    // the highlighted option is rendered: its index is the one its element was rendered at
    private readonly current = computed<number | undefined>(() => {
        const highlighted = this.root.highlighted();
        if (highlighted === null) {
            return undefined;
        }
        for (const [index, element] of this.virtual.elements()) {
            if (element.id === highlighted) {
                return index;
            }
        }
        return undefined;
    });
    /** The virtualizer and its rows, for the row directive. */
    readonly virtual: VirtualRows<ComboboxItemValue> = injectVirtualRows({
        createVirtualizer,
        host: injectHost(),
        items: () => this.root.entries(),
        pinned: (): number[] =>
            reachableRows(
                this.root.entries().length,
                this.current(),
                this.selectedIndex(),
            ),
        itemSize: this.itemSize,
        measure: this.measure,
        overscan: this.overscan,
        loading: this.loading,
        loadMore: () => this.loadMore.emit(),
    });
    /** The rows to render: `@for (row of list.rows(); track row.index)`. */
    readonly rows: () => readonly VirtualRowData<ComboboxItemValue>[] =
        this.virtual.rows;

    constructor() {
        const root = this.root;
        // the highlighted row in view, by its offset: after the Item's own scroll (its effect runs
        // in an earlier phase, again once the popup is placed), which reads boxes a popup's
        // opening scale transforms
        afterRenderEffect({
            read: () => {
                const index = this.current();
                root.overlay.positioner();
                if (index !== undefined) {
                    untracked(() =>
                        this.virtual.virtualizer.scrollToIndex(index),
                    );
                }
            },
        });
    }
}
