import { defineComponent, inject } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    checkedAttributes,
    type MenuCheckableItemState,
    MenuCheckboxItemKey,
    MenuKey,
} from "./menu-context.ts";

/** Marks a checked CheckboxItem; hidden from assistive technologies (spec/menu.md). */
export interface MenuCheckboxItemIndicatorProps {
    /** Rendered while the item is unchecked too (default `false`). */
    keepMounted?: boolean;
}

export const MenuCheckboxItemIndicator: PartComponent<
    MenuCheckboxItemIndicatorProps,
    MenuCheckableItemState
> = publicComponent(
    defineComponent({
        name: "MenuCheckboxItemIndicator",
        inheritAttrs: false,
        props: { ...asProp, keepMounted: { type: Boolean, default: false } },
        setup(props, { attrs, slots }) {
            const state = useRequiredContext(
                MenuCheckboxItemKey,
                "Menu.CheckboxItemIndicator",
            );
            const component = inject(MenuKey, null)?.component ?? "menu";
            return () => {
                if (!state.value.checked && !props.keepMounted) {
                    return null;
                }
                const { highlighted: _highlighted, ...attributes } =
                    checkedAttributes(state.value);
                return renderPart(
                    "span",
                    { attrs, slots },
                    props.as,
                    state.value,
                    {
                        "aria-hidden": "true",
                        "data-primitives-part": `${component}-checkbox-item-indicator`,
                        ...stateAttributes(attributes),
                    },
                );
            };
        },
    }),
);
