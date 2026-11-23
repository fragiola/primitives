import { type ReactNode, type Ref, useLayoutEffect, useRef } from "react";
import { useElement } from "../../hooks/use-element.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import {
    reachableRows,
    useVirtualRows,
    type VirtualListProps,
} from "../../hooks/use-virtual-rows.ts";
import { mergeRefs } from "../../utils/merge-refs.ts";
import type { PartProps } from "../../utils/render-element.tsx";
import { AutocompleteContext } from "../autocomplete/autocomplete-context.ts";
import { AutocompleteList } from "../autocomplete/autocomplete-list.tsx";

export interface AutocompleteVirtualListProps<Entry = unknown>
    extends Omit<PartProps<{ empty: boolean }>, "children">,
        VirtualListProps {
    /** An `Autocomplete.Item` for each matching suggestion in view (the Root's `items`, flat). */
    children: (entry: Entry, index: number) => ReactNode;
}

/**
 * Autocomplete's List rendering only the matching suggestions in view (spec/virtual-lists.md): the ends and the
 * highlighted suggestion with its neighbours stay rendered, so the Input's keys
 * and `aria-activedescendant` behave as with every item rendered.
 */
export function AutocompleteVirtualList<Entry = unknown>({
    children,
    itemSize,
    measure,
    overscan,
    loading = false,
    onLoadMore,
    ref,
    ...props
}: AutocompleteVirtualListProps<Entry>) {
    const context = useRequiredContext(
        AutocompleteContext,
        "AutocompleteVirtual.List",
    );
    const [list, setList] = useElement<HTMLElement>();
    const entries = context.entries as readonly Entry[];
    const { highlighted } = context;
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
        pinned: reachableRows(entries.length, current, -1),
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
        <AutocompleteList
            {...props}
            ref={mergeRefs(setList, ref as Ref<HTMLElement> | undefined)}
            aria-busy={loading ? "true" : undefined}
            data-loading={loading ? "" : undefined}
        >
            {virtual.rows}
        </AutocompleteList>
    );
}
