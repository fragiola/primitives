import { useContext } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    checkedAttributes,
    type MenuCheckableItemState,
    MenuCheckboxItemContext,
    MenuContext,
} from "./menu-context.ts";

export interface MenuCheckboxItemIndicatorProps
    extends PartProps<MenuCheckableItemState> {
    /** Rendered while the item is unchecked too (default `false`). */
    keepMounted?: boolean;
}

/** Marks a checked CheckboxItem; hidden from assistive technologies (spec/menu.md). */
export function MenuCheckboxItemIndicator({
    keepMounted = false,
    ...props
}: MenuCheckboxItemIndicatorProps) {
    const state = useRequiredContext(
        MenuCheckboxItemContext,
        "Menu.CheckboxItemIndicator",
    );
    const component = useContext(MenuContext)?.component ?? "menu";
    if (!state.checked && !keepMounted) {
        return null;
    }
    const { highlighted: _highlighted, ...attributes } =
        checkedAttributes(state);
    return renderElement("span", props, state, {
        "aria-hidden": "true",
        "data-primitives-part": `${component}-checkbox-item-indicator`,
        ...stateAttributes(attributes),
    });
}
