import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { CascadeSelectItemKey } from "./cascade-select-context.ts";

export interface CascadeSelectItemIndicatorState {
    selected: boolean;
}

export interface CascadeSelectItemIndicatorProps {
    /** Rendered while the item is not on the chosen path too. */
    keepMounted?: boolean;
}

/** Marks an item of the chosen path; hidden from assistive technologies (spec/cascade-select.md). */
export const CascadeSelectItemIndicator: PartComponent<
    CascadeSelectItemIndicatorProps,
    CascadeSelectItemIndicatorState
> = publicComponent(
    defineComponent({
        name: "CascadeSelectItemIndicator",
        inheritAttrs: false,
        props: {
            ...asProp,
            /** Rendered while the item is not on the chosen path too. */
            keepMounted: { type: Boolean, default: false },
        },
        setup(props, { attrs, slots }) {
            const item = useRequiredContext(
                CascadeSelectItemKey,
                "CascadeSelect.ItemIndicator",
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
                        "data-primitives-part": "cascade-select-item-indicator",
                    },
                );
            };
        },
    }),
);
