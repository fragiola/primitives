import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { SelectItemKey } from "./select-context.ts";

export interface SelectItemIndicatorState {
    selected: boolean;
}

export interface SelectItemIndicatorProps {
    /** Rendered while the item is not selected too. */
    keepMounted?: boolean;
}

/** Marks the selected item; hidden from assistive technologies (spec/select.md). */
export const SelectItemIndicator: PartComponent<
    SelectItemIndicatorProps,
    SelectItemIndicatorState
> = publicComponent(
    defineComponent({
        name: "SelectItemIndicator",
        inheritAttrs: false,
        props: {
            ...asProp,
            /** Rendered while the item is not selected too. */
            keepMounted: { type: Boolean, default: false },
        },
        setup(props, { attrs, slots }) {
            const item = useRequiredContext(
                SelectItemKey,
                "Select.ItemIndicator",
            );
            return () => {
                const selected = item.value.selected;
                if (!selected && !props.keepMounted) {
                    return null;
                }
                return renderPart(
                    "span",
                    { attrs, slots },
                    props.as,
                    { selected },
                    {
                        "aria-hidden": "true",
                        "data-primitives-part": "select-item-indicator",
                    },
                );
            };
        },
    }),
);
