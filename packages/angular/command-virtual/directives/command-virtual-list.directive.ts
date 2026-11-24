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
import {
    bestMatch,
    type CommandEntry,
    commandMatches,
} from "@fragiola/primitives/command";
import { createVirtualizer } from "@fragiola/primitives/virtual";
import { CommandList, CommandRoot } from "@fragiola/primitives-angular/command";
import {
    injectHost,
    injectVirtualRows,
    reachableRows,
    type VirtualItemSize,
    type VirtualRowData,
    type VirtualRows,
} from "@fragiola/primitives-angular/internal";

/**
 * Command's List rendering only the matching Items in view (spec/command.md, "Virtual list"): it
 * is a `[commandList]` (a host directive), whose template renders `rows()` (`exportAs`) over the
 * entries of `items` matching the Root's text, each a `[commandItem]` with the
 * `[commandVirtualRow]` bound to its row:
 * `<div commandVirtualList #list="commandVirtualList" [items]="entries">` around
 * `@for (row of list.rows(); track row.index) { <div commandItem [commandVirtualRow]="row" [value]="row.item.value">...</div> }`.
 * The ends, the highlighted Item with its neighbours and the best match stay rendered, so the
 * Input's keys and the highlight behave as with every Item rendered.
 */
@Directive({
    selector: "[commandVirtualList]",
    exportAs: "commandVirtualList",
    hostDirectives: [CommandList],
    host: {
        "[attr.aria-busy]": "loading() || root.loading() ? 'true' : null",
        "[attr.data-loading]": "loading() || root.loading() ? '' : null",
    },
})
export class CommandVirtualList {
    /** The entries: the List filters them with the Root's text and `filter`. */
    readonly items = input.required<readonly CommandEntry[]>();
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

    protected readonly root = inject(CommandRoot);
    private readonly matches = computed(() =>
        commandMatches(
            this.items(),
            this.root.search(),
            this.root.resolvedFilter(),
        ),
    );
    private readonly best = computed(() => {
        const { entries, scores } = this.matches();
        return bestMatch(scores, (index) => entries[index]?.disabled === true);
    });
    private readonly current = computed<number | undefined>(() => {
        const highlighted = this.root.highlighted();
        const found = this.matches().entries.findIndex(
            (entry) => entry.value === highlighted,
        );
        return found === -1 ? undefined : found;
    });
    /** The virtualizer and its rows, for the row directive. */
    readonly virtual: VirtualRows<CommandEntry> = injectVirtualRows({
        createVirtualizer,
        host: injectHost(),
        items: () => this.matches().entries,
        pinned: (): number[] =>
            reachableRows(
                this.matches().entries.length,
                this.current(),
                this.best(),
            ),
        itemSize: this.itemSize,
        measure: this.measure,
        overscan: this.overscan,
        loading: this.loading,
        loadMore: () => this.loadMore.emit(),
    });
    /** The rows to render: `@for (row of list.rows(); track row.index)`. */
    readonly rows: () => readonly VirtualRowData<CommandEntry>[] =
        this.virtual.rows;

    constructor() {
        // the highlighted row in view, by its offset (the Item scrolls only within what is
        // rendered)
        afterRenderEffect({
            read: () => {
                const index = this.current();
                if (index !== undefined) {
                    untracked(() =>
                        this.virtual.virtualizer.scrollToIndex(index),
                    );
                }
            },
        });
    }
}
