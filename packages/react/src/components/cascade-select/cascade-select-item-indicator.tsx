import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { CascadeSelectItemContext } from "./cascade-select-context.ts";

export interface CascadeSelectItemIndicatorProps
    extends PartProps<{ selected: boolean }> {
    /** Rendered while the item is not on the chosen path too. */
    keepMounted?: boolean;
}

/** Marks an item of the chosen path; hidden from assistive technologies (spec/cascade-select.md). */
export function CascadeSelectItemIndicator({
    keepMounted = false,
    ...props
}: CascadeSelectItemIndicatorProps) {
    const item = useRequiredContext(
        CascadeSelectItemContext,
        "CascadeSelect.ItemIndicator",
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
            "data-primitives-part": "cascade-select-item-indicator",
        },
    );
}
