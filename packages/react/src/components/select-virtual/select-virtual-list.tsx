import { type ReactNode, type Ref, useLayoutEffect, useMemo } from "react";
import { useElement } from "../../hooks/use-element.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import {
    useVirtualRows,
    type VirtualListProps,
} from "../../hooks/use-virtual-rows.ts";
import { mergeRefs } from "../../utils/merge-refs.ts";
import type { PartProps } from "../../utils/render-element.tsx";
import {
    SelectContext,
    type SelectItemData,
} from "../select/select-context.ts";
import { SelectList } from "../select/select-list.tsx";

export interface SelectVirtualListProps
    extends Omit<PartProps<{ open: boolean }>, "children">,
        VirtualListProps {
    /** A `Select.Item` for each item of the Root's `items` in view. */
    children: (item: SelectItemData, index: number) => ReactNode;
}

/**
 * Select's List rendering only the Root's `items` in view (spec/virtual-lists.md): the highlighted
 * and selected items stay rendered, so `aria-activedescendant` names a rendered option.
 */
export function SelectVirtualList({
    children,
    itemSize,
    measure,
    overscan,
    loading = false,
    onLoadMore,
    ref,
    ...props
}: SelectVirtualListProps) {
    const context = useRequiredContext(SelectContext, "SelectVirtual.List");
    const [list, setList] = useElement<HTMLElement>();
    const { items, highlighted, value } = context;
    const pinned = useMemo(
        () =>
            items.flatMap((item, index) =>
                item.value === highlighted || item.value === value
                    ? [index]
                    : [],
            ),
        [items, highlighted, value],
    );
    const { rows, virtualizer } = useVirtualRows({
        items,
        render: children,
        pinned,
        list,
        itemSize,
        measure,
        overscan,
        loading,
        onLoadMore,
    });
    // the highlighted row in view, by its offset: after the Item's own scroll (its effect runs
    // first, again once the popup is placed), which reads boxes a popup's opening scale transforms
    const active = items.findIndex((item) => item.value === highlighted);
    const { positioner } = context;
    useLayoutEffect(() => {
        if (active >= 0) {
            virtualizer.scrollToIndex(active);
        }
    }, [active, virtualizer, positioner]);
    return (
        <SelectList
            {...props}
            ref={mergeRefs(setList, ref as Ref<HTMLElement> | undefined)}
            aria-busy={loading ? "true" : undefined}
            data-loading={loading ? "" : undefined}
        >
            {rows}
        </SelectList>
    );
}
