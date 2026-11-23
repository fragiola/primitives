import {
    type ReactNode,
    type Ref,
    useLayoutEffect,
    useMemo,
    useRef,
} from "react";
import { useElement } from "../../hooks/use-element.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import {
    reachableRows,
    useVirtualRows,
    type VirtualListProps,
} from "../../hooks/use-virtual-rows.ts";
import { mergeRefs } from "../../utils/merge-refs.ts";
import type { PartProps } from "../../utils/render-element.tsx";
import { ComboboxContext } from "../combobox/combobox-context.ts";
import { ComboboxList } from "../combobox/combobox-list.tsx";

export interface ComboboxVirtualListProps<Entry = unknown>
    extends Omit<PartProps<{ empty: boolean }>, "children">,
        VirtualListProps {
    /** A `Combobox.Item` for each matching item in view (the Root's `items`, flat). */
    children: (entry: Entry, index: number) => ReactNode;
}

/**
 * Combobox's List rendering only the matching items in view (spec/virtual-lists.md): the ends, the
 * highlighted item with its neighbours and the selected item stay rendered, so the Input's keys
 * and `aria-activedescendant` behave as with every item rendered.
 */
export function ComboboxVirtualList<Entry = unknown>({
    children,
    itemSize,
    measure,
    overscan,
    loading = false,
    onLoadMore,
    ref,
    ...props
}: ComboboxVirtualListProps<Entry>) {
    const context = useRequiredContext(ComboboxContext, "ComboboxVirtual.List");
    const [list, setList] = useElement<HTMLElement>();
    const entries = context.entries as readonly Entry[];
    const { multiple, isSelected, highlighted } = context;
    const selected = useMemo(
        () => (multiple ? -1 : entries.findIndex((entry) => isSelected(entry))),
        [entries, multiple, isSelected],
    );
    // the highlighted option is rendered: its index is the one its element was rendered at
    const elements = useRef<ReadonlyMap<number, HTMLElement>>(new Map());
    let current: number | undefined;
    for (const [index, element] of elements.current) {
        if (highlighted !== null && element.id === highlighted) {
            current = index;
        }
    }
    const virtual = useVirtualRows({
        items: entries,
        render: children,
        pinned: reachableRows(entries.length, current, selected),
        list,
        itemSize,
        measure,
        overscan,
        loading,
        onLoadMore,
    });
    elements.current = virtual.elements;
    // the highlighted row in view, by its offset: after the Item's own scroll (its effect runs
    // first, again once the popup is placed), which reads boxes a popup's opening scale transforms
    const { virtualizer } = virtual;
    const { positioner } = context;
    useLayoutEffect(() => {
        if (current !== undefined) {
            virtualizer.scrollToIndex(current);
        }
    }, [current, virtualizer, positioner]);
    return (
        <ComboboxList
            {...props}
            ref={mergeRefs(setList, ref as Ref<HTMLElement> | undefined)}
            aria-busy={loading ? "true" : undefined}
            data-loading={loading ? "" : undefined}
        >
            {virtual.rows}
        </ComboboxList>
    );
}
