import {
    createVirtualizer,
    type Virtualizer,
    type VirtualRange,
} from "@fragiola/primitives/virtual";
import {
    type CSSProperties,
    cloneElement,
    isValidElement,
    type ReactNode,
    type Ref,
    useEffect,
    useLayoutEffect,
    useReducer,
    useRef,
    useState,
} from "react";
import { mergeRefs } from "../utils/merge-refs.ts";

/** The props every virtual part takes (spec/virtual-lists.md, "API"). */
export interface VirtualListProps {
    /** A row's size in pixels before it is measured, or every row's with `measure={false}`. */
    itemSize?: number | ((index: number) => number);
    /** Measure the rendered rows (default `true`); `false`: fixed sizes. */
    measure?: boolean;
    /** The rows rendered beyond each end of the view (default 4). */
    overscan?: number;
    /** The list is loading (`data-loading`, `aria-busy`). */
    loading?: boolean;
    /** The last row came into view while not `loading`: load the next page. */
    onLoadMore?: () => void;
}

export interface VirtualRowsOptions<Item> extends VirtualListProps {
    items: readonly Item[];
    /** The consumer's render function: an Item element for an item. */
    render: (item: Item, index: number) => ReactNode;
    /** Rows always rendered (the focused, highlighted or selected one; the ends). */
    pinned: readonly number[];
    /** The list element: its scroll container is watched once it mounts. */
    list: HTMLElement | null;
}

export interface VirtualRows {
    /** The rendered rows: the consumer's Items, with their place in the set and their room. */
    rows: ReactNode[];
    range: VirtualRange;
    virtualizer: Virtualizer;
    /** The rendered rows' elements, by index. */
    elements: ReadonlyMap<number, HTMLElement>;
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

type StyleProp =
    | CSSProperties
    | ((state: never) => CSSProperties | undefined)
    | undefined;

/**
 * The row's structural style merged into the Item's own (an object or a function): it never
 * shrinks (a flex column that scrolls would squeeze its rows), takes no part in the browser's
 * scroll anchoring (the virtualizer anchors the view itself), and its room as margins.
 */
function withRoom(style: StyleProp, room: CSSProperties): StyleProp {
    if (typeof style === "function") {
        return (state: never) => ({ ...style(state), ...room });
    }
    return { ...style, ...room };
}

/**
 * The rows of a virtual list (spec/virtual-lists.md): the toolkit's virtualizer over the items,
 * attached to the list's scroll container, each rendered row the consumer's Item with
 * `aria-setsize`, `aria-posinset`, `data-index`, its room as margins, `flex-shrink: 0`, `overflow-anchor: none` and, unless `measure` is
 * `false`, measured. Calls `onLoadMore` when the last row comes into view.
 */
export function useVirtualRows<Item>({
    items,
    render,
    pinned,
    list,
    itemSize = 36,
    measure = true,
    overscan = 4,
    loading = false,
    onLoadMore,
}: VirtualRowsOptions<Item>): VirtualRows {
    const [, rerender] = useReducer((count: number) => count + 1, 0);
    const [virtualizer] = useState(() =>
        createVirtualizer({ count: items.length, onChange: rerender }),
    );
    virtualizer.update({
        count: items.length,
        estimateSize: itemSize,
        overscan,
        pinned,
    });
    const range = virtualizer.range();
    const elements = useRef(new Map<number, HTMLElement>()).current;

    useLayoutEffect(
        () => (list === null ? undefined : virtualizer.attach(list)),
        [list, virtualizer],
    );

    const count = items.length;
    const end = range.visibleEnd;
    const loadMore = useRef(onLoadMore);
    loadMore.current = onLoadMore;
    useEffect(() => {
        if (!loading && count > 0 && end >= count - 1) {
            loadMore.current?.();
        }
    }, [loading, count, end]);

    const last = range.rows.length - 1;
    const rows = range.rows.map((row, position) => {
        const element = render(items[row.index] as Item, row.index);
        if (!isValidElement<Record<string, unknown>>(element)) {
            return element;
        }
        const index = row.index;
        const own = element.props;
        const ref = (node: HTMLElement | null) => {
            if (node === null) {
                return undefined;
            }
            elements.set(index, node);
            const stop = measure ? virtualizer.measure(index, node) : undefined;
            return () => {
                if (elements.get(index) === node) {
                    elements.delete(index);
                }
                stop?.();
            };
        };
        return cloneElement(element, {
            key: element.key ?? index,
            ref: mergeRefs(own.ref as Ref<HTMLElement> | undefined, ref),
            style: withRoom(own.style as StyleProp, {
                flexShrink: 0,
                overflowAnchor: "none",
                marginBlockStart:
                    row.spaceBefore > 0 ? row.spaceBefore : undefined,
                marginBlockEnd:
                    position === last && range.spaceAfter > 0
                        ? range.spaceAfter
                        : undefined,
            }),
            "aria-setsize": count,
            "aria-posinset": index + 1,
            "data-index": index,
        });
    });
    return { rows, range, virtualizer, elements };
}
