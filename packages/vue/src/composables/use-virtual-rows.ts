import {
    createVirtualizer,
    type Virtualizer,
    type VirtualRange,
} from "@fragiola/primitives/virtual";
import {
    Comment,
    type ComputedRef,
    cloneVNode,
    computed,
    isVNode,
    onBeforeUnmount,
    onMounted,
    onUpdated,
    type PropType,
    type ShallowRef,
    shallowRef,
    type VNode,
    watch,
} from "vue";

/** The props every virtual part takes (spec/virtual-lists.md, "API"). */
export interface VirtualListProps {
    /** A row's size in pixels before it is measured, or every row's with `measure: false`. */
    itemSize?: number | ((index: number) => number);
    /** Measure the rendered rows (default `true`); `false`: fixed sizes. */
    measure?: boolean;
    /** The rows rendered beyond each end of the view (default 4). */
    overscan?: number;
    /** The list is loading (`data-loading`, `aria-busy`). */
    loading?: boolean;
}

/** The events every virtual part emits: `loadMore`, when the last row came into view. */
export type VirtualListEmits = {
    loadMore: () => true;
};

/** The Vue props of `VirtualListProps`, for a part's `props` option. */
export const virtualListProps = {
    itemSize: {
        type: [Number, Function] as PropType<
            number | ((index: number) => number)
        >,
        default: 36,
    },
    measure: { type: Boolean, default: true },
    overscan: { type: Number, default: 4 },
    loading: { type: Boolean, default: false },
};

export interface VirtualRowsOptions<Item> {
    /** Every item, in the list's order. */
    items: () => readonly Item[];
    /** Rows always rendered (the focused, highlighted or selected one; the ends). */
    pinned: () => readonly number[];
    /** The list element: its scroll container is watched once it mounts. */
    list: ShallowRef<HTMLElement | null>;
    /** The part's props (`itemSize`, `measure`, `overscan`, `loading`). */
    props: Required<VirtualListProps>;
    /** The last row came into view while not `loading`. */
    onLoadMore: () => void;
    /** Where to keep the rendered rows' elements (default: a new ref). */
    elements?: ShallowRef<ReadonlyMap<number, HTMLElement>>;
}

export interface VirtualRows<Item> {
    /**
     * The rendered rows, called in the part's render: the consumer's Item for each row (its
     * scoped slot), with its place in the set and its room.
     */
    rows: (
        render:
            | ((item: Item, index: number) => VNode[] | undefined)
            | undefined,
    ) => VNode[];
    range: ComputedRef<VirtualRange>;
    virtualizer: Virtualizer;
    /** The rendered rows' elements, by index (read from the DOM after each render). */
    elements: ShallowRef<ReadonlyMap<number, HTMLElement>>;
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

function sameElements(
    a: ReadonlyMap<number, HTMLElement>,
    b: ReadonlyMap<number, HTMLElement>,
): boolean {
    if (a.size !== b.size) {
        return false;
    }
    for (const [index, element] of a) {
        if (b.get(index) !== element) {
            return false;
        }
    }
    return true;
}

/**
 * The rows of a virtual list (spec/virtual-lists.md): the toolkit's virtualizer over the items,
 * attached to the list's scroll container once mounted, each rendered row the consumer's Item
 * (cloned) with `aria-setsize`, `aria-posinset`, `data-index`, its room as margins,
 * `flex-shrink: 0`, `overflow-anchor: none` and, unless `measure` is `false`, measured. Calls
 * `onLoadMore` when the last row comes into view.
 */
export function useVirtualRows<Item>(
    options: VirtualRowsOptions<Item>,
): VirtualRows<Item> {
    const { props } = options;
    // bumped when the virtualizer's rows or their room change: the part renders again
    const version = shallowRef(0);
    const virtualizer = createVirtualizer({
        count: options.items().length,
        onChange: () => {
            version.value += 1;
        },
    });
    const range = computed(() => {
        version.value;
        virtualizer.update({
            count: options.items().length,
            estimateSize: props.itemSize,
            overscan: props.overscan,
            pinned: options.pinned(),
        });
        return virtualizer.range();
    });
    const elements =
        options.elements ??
        shallowRef<ReadonlyMap<number, HTMLElement>>(new Map());

    // the rendered rows, read from the DOM after each render: measured (by index), and known
    // by index (a combobox finds its highlighted row's index)
    const measured = new Map<
        HTMLElement,
        { index: number; stop: (() => void) | undefined }
    >();
    let attached: HTMLElement | null = null;
    let detach: (() => void) | null = null;
    const sync = () => {
        const list = options.list.value;
        if (list !== attached) {
            detach?.();
            detach = list === null ? null : virtualizer.attach(list);
            attached = list;
        }
        const next = new Map<number, HTMLElement>();
        if (list !== null) {
            for (const element of list.querySelectorAll<HTMLElement>(
                ":scope > [data-index]",
            )) {
                next.set(Number(element.dataset.index), element);
            }
        }
        for (const [element, entry] of measured) {
            if (next.get(entry.index) !== element) {
                entry.stop?.();
                measured.delete(element);
            }
        }
        for (const [index, element] of next) {
            if (!measured.has(element)) {
                measured.set(element, {
                    index,
                    stop: props.measure
                        ? virtualizer.measure(index, element)
                        : undefined,
                });
            }
        }
        if (!sameElements(elements.value, next)) {
            elements.value = next;
        }
    };
    onMounted(sync);
    onUpdated(sync);
    onBeforeUnmount(() => {
        for (const entry of measured.values()) {
            entry.stop?.();
        }
        measured.clear();
        detach?.();
        detach = null;
        attached = null;
    });

    const loadMore = () => {
        const count = options.items().length;
        if (
            !props.loading &&
            count > 0 &&
            range.value.visibleEnd >= count - 1
        ) {
            options.onLoadMore();
        }
    };
    onMounted(loadMore);
    watch(
        () =>
            [
                props.loading,
                options.items().length,
                range.value.visibleEnd,
            ] as const,
        loadMore,
        { flush: "post" },
    );

    const rows: VirtualRows<Item>["rows"] = (render) => {
        const current = range.value;
        const items = options.items();
        const count = items.length;
        const last = current.rows.length - 1;
        return current.rows.flatMap((row, position) => {
            const index = row.index;
            const nodes = render?.(items[index] as Item, index) ?? [];
            const at = nodes.findIndex(
                (node) => isVNode(node) && node.type !== Comment,
            );
            const element = nodes[at];
            if (element === undefined) {
                return nodes;
            }
            // the row's structural style: it never shrinks (a flex column that scrolls would
            // squeeze its rows), takes no part in the browser's scroll anchoring (the
            // virtualizer anchors the view itself), and its room as margins
            const style: Record<string, string | number> = {
                flexShrink: 0,
                overflowAnchor: "none",
            };
            if (row.spaceBefore > 0) {
                style.marginBlockStart = `${row.spaceBefore}px`;
            }
            if (position === last && current.spaceAfter > 0) {
                style.marginBlockEnd = `${current.spaceAfter}px`;
            }
            const clone = cloneVNode(element, {
                key: element.key ?? index,
                style,
                "aria-setsize": count,
                "aria-posinset": index + 1,
                "data-index": index,
            });
            return nodes.map((node, place) => (place === at ? clone : node));
        });
    };
    return { rows, range, virtualizer, elements };
}
