import { cascadePathItems } from "@fragiola/primitives/cascade";
import type { ReactNode } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { CascadeSelectContext } from "./cascade-select-context.ts";

export interface CascadeSelectValueProps
    extends PartProps<{ placeholder: boolean }> {
    /** Shown while nothing is chosen. */
    placeholder?: ReactNode;
    /** Joins the labels of the whole path; without it, the last chosen item's label. */
    separator?: string;
}

/** The chosen path's label, or the placeholder (spec/cascade-select.md). */
export function CascadeSelectValue({
    placeholder,
    separator,
    ...props
}: CascadeSelectValueProps) {
    const context = useRequiredContext(
        CascadeSelectContext,
        "CascadeSelect.Value",
    );
    const found = cascadePathItems(context.items, context.value) ?? [];
    const labels = found.map((item) => item.label);
    const label =
        labels.length === 0
            ? undefined
            : separator === undefined
              ? labels.at(-1)
              : labels.join(separator);
    const isPlaceholder = label === undefined;
    return renderElement(
        "span",
        { children: isPlaceholder ? placeholder : label, ...props },
        { placeholder: isPlaceholder },
        {
            "data-primitives-part": "cascade-select-value",
            ...stateAttributes({ placeholder: isPlaceholder }),
        },
    );
}
