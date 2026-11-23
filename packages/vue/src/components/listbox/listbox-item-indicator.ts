import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { ListboxItemKey } from "./listbox-context.ts";

export interface ListboxItemIndicatorState {
    selected: boolean;
}

export interface ListboxItemIndicatorProps {
    /** Rendered while the item is not selected too. */
    keepMounted?: boolean;
}

/** Marks a selected item; hidden from assistive technologies (spec/listbox.md). */
export const ListboxItemIndicator: PartComponent<
    ListboxItemIndicatorProps,
    ListboxItemIndicatorState
> = publicComponent(
    defineComponent({
        name: "ListboxItemIndicator",
        inheritAttrs: false,
        props: {
            ...asProp,
            /** Rendered while the item is not selected too. */
            keepMounted: { type: Boolean, default: false },
        },
        setup(props, { attrs, slots }) {
            const item = useRequiredContext(
                ListboxItemKey,
                "Listbox.ItemIndicator",
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
                        "data-primitives-part": "listbox-item-indicator",
                    },
                );
            };
        },
    }),
);
