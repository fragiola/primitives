import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { ListboxItemContext } from "./listbox-context.ts";

export interface ListboxItemIndicatorProps
    extends PartProps<{ selected: boolean }> {
    /** Rendered while the item is not selected too. */
    keepMounted?: boolean;
}

/** Marks a selected item; hidden from assistive technologies (spec/listbox.md). */
export function ListboxItemIndicator({
    keepMounted = false,
    ...props
}: ListboxItemIndicatorProps) {
    const item = useRequiredContext(
        ListboxItemContext,
        "Listbox.ItemIndicator",
    );
    if (!item.selected && !keepMounted) {
        return null;
    }
    return renderElement(
        "span",
        props,
        { selected: item.selected },
        {
            "aria-hidden": "true",
            "data-primitives-part": "listbox-item-indicator",
        },
    );
}
