import {
    afterNextRender,
    afterRenderEffect,
    computed,
    DestroyRef,
    effect,
    inject,
    type Signal,
    signal,
    untracked,
} from "@angular/core";
// types only: the virtual entries pass the toolkit's `createVirtualizer` in, so this shared entry
// imports nothing of `/virtual` and the components that do not opt in never reference it
import type {
    createVirtualizer,
    Virtualizer,
    VirtualRange,
} from "@fragiola/primitives/virtual";

/** A row's size in pixels before it is measured: a number, or a function of the index. */
export type VirtualItemSize = number | ((index: number) => number);

/**
 * A rendered row of a virtual list (spec/virtual-lists.md): its item, its place in the set and the
 * room the unrendered rows take before and after it. The template renders a part's `rows()` with
 * an `@for (row of list.rows(); track row.index)`, each Item with the part's row directive bound to
 * it.
 */
export interface VirtualRowData<Item> {
    readonly index: number;
    readonly item: Item;
    /** The number of items (`aria-setsize`). */
    readonly setSize: number;
    /** The room of the unrendered rows before it (its `margin-block-start`), or `null`. */
    readonly spaceBefore: number | null;
    /** On the last rendered row, the room of the unrendered rows after it, or `null`. */
    readonly spaceAfter: number | null;
}

export interface VirtualRowsOptions<Item> {
    /** The toolkit's `createVirtualizer` (`@fragiola/primitives/virtual`). */
    createVirtualizer: typeof createVirtualizer;
    /** The list element: its scroll container is watched once it renders. */
    host: HTMLElement;
    items: () => readonly Item[];
    /** Rows always rendered (the focused, highlighted or selected one; the ends). */
    pinned: () => readonly number[];
    itemSize: Signal<VirtualItemSize>;
    measure: Signal<boolean>;
    overscan: Signal<number>;
    loading: Signal<boolean>;
    /** The last row came into view while not `loading`. */
    loadMore: () => void;
}

export interface VirtualRows<Item> {
    /** The rendered rows. */
    rows: Signal<readonly VirtualRowData<Item>[]>;
    range: Signal<VirtualRange>;
    virtualizer: Virtualizer;
    /** The rendered rows' elements, by index. */
    elements: Signal<ReadonlyMap<number, HTMLElement>>;
    /** Whether the rows are measured (`measure`). */
    measure: Signal<boolean>;
    /** A row's element rendered at `index`; returns its unregistration. */
    register(index: number, element: HTMLElement): () => void;
}

/**
 * The rows of a virtual list (spec/virtual-lists.md), in an injection context: the toolkit's
 * virtualizer over the items, attached to the list's scroll container after the first render (on
 * a server, the first rows and the pinned ones), rendering again when its range changes; emits
 * `loadMore` when the last row comes into view while not `loading`.
 */
export function injectVirtualRows<Item>(
    options: VirtualRowsOptions<Item>,
): VirtualRows<Item> {
    const version = signal(0);
    const virtualizer = options.createVirtualizer({
        count: 0,
        onChange: () => version.update((count) => count + 1),
    });
    const range = computed(() => {
        version();
        const count = options.items().length;
        const estimateSize = options.itemSize();
        const overscan = options.overscan();
        const pinned = options.pinned();
        virtualizer.update({ count, estimateSize, overscan, pinned });
        return virtualizer.range();
    });
    const rows = computed<readonly VirtualRowData<Item>[]>(() => {
        const current = range();
        const items = options.items();
        const last = current.rows.length - 1;
        return current.rows.map((row, position) => ({
            index: row.index,
            item: items[row.index] as Item,
            setSize: items.length,
            spaceBefore: row.spaceBefore > 0 ? row.spaceBefore : null,
            spaceAfter:
                position === last && current.spaceAfter > 0
                    ? current.spaceAfter
                    : null,
        }));
    });
    const elements = signal<ReadonlyMap<number, HTMLElement>>(new Map());

    let detach: (() => void) | null = null;
    afterNextRender(() => {
        detach = virtualizer.attach(options.host);
    });
    inject(DestroyRef).onDestroy(() => detach?.());

    // load more on scroll end: once per change of the loading state, the count or the last row in
    // view
    const end = computed(() => range().visibleEnd);
    const count = computed(() => options.items().length);
    effect(() => {
        const loading = options.loading();
        const total = count();
        if (!loading && total > 0 && end() >= total - 1) {
            untracked(options.loadMore);
        }
    });

    return {
        rows,
        range,
        virtualizer,
        elements,
        measure: options.measure,
        register(index, element) {
            elements.update((current) => new Map(current).set(index, element));
            return () =>
                elements.update((current) => {
                    if (current.get(index) !== element) {
                        return current;
                    }
                    const next = new Map(current);
                    next.delete(index);
                    return next;
                });
        },
    };
}

/**
 * A row directive's work, in its injection context: registers its element at its index and, unless
 * the list's `measure` is `false`, measures it once rendered and on every resize.
 */
export function bindVirtualRow(
    rows: VirtualRows<unknown>,
    row: Signal<VirtualRowData<unknown>>,
    host: HTMLElement,
): void {
    const index = computed(() => row().index);
    afterRenderEffect((onCleanup) => {
        const at = index();
        const stop = untracked(() => rows.register(at, host));
        onCleanup(stop);
    });
    afterRenderEffect((onCleanup) => {
        const at = index();
        if (!rows.measure()) {
            return;
        }
        const stop = untracked(() => rows.virtualizer.measure(at, host));
        onCleanup(stop);
    });
}

/**
 * The rows a combobox's keys reach from the DOM (Combobox, Autocomplete): the ends, the
 * highlighted row and its neighbours, and the selected row (the list opens on it).
 */
export function reachableRows(
    count: number,
    highlighted: number | undefined,
    selected: number,
): number[] {
    const rows = [0, count - 1];
    if (highlighted !== undefined) {
        rows.push(highlighted - 1, highlighted, highlighted + 1);
    }
    if (selected >= 0) {
        rows.push(selected);
    }
    return rows;
}
