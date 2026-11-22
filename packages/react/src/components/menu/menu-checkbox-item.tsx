import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useElement } from "../../hooks/use-element.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    checkedAttributes,
    type MenuCheckableItemState,
    MenuCheckboxItemContext,
    MenuContext,
} from "./menu-context.ts";
import { useCheckableItem } from "./use-checkable-item.ts";
import { useMenuItem } from "./use-menu-item.ts";

export type MenuCheckboxItemState = MenuCheckableItemState;

export interface MenuCheckboxItemProps
    extends PartProps<MenuCheckboxItemState> {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean, details: ChangeDetails) => void;
    disabled?: boolean;
    /** The text typeahead matches (default: the item's text). */
    label?: string;
    /** A click closes every menu level (default `false`; Enter always closes, Space never). */
    closeOnClick?: boolean;
}

/** A `menuitemcheckbox` (spec/menu.md): toggles its checked state. */
export function MenuCheckboxItem({
    checked: checkedProp,
    defaultChecked = false,
    onCheckedChange,
    disabled = false,
    label,
    closeOnClick = false,
    onClick,
    children,
    ...props
}: MenuCheckboxItemProps) {
    const context = useRequiredContext(MenuContext, "Menu.CheckboxItem");
    const [element, ref] = useElement<HTMLElement>();
    const item = useMenuItem(context, element, label, false);
    const [checked, setChecked] = useControllableState(
        checkedProp,
        defaultChecked,
        onCheckedChange,
    );
    const activation = useCheckableItem(context, {
        disabled,
        closeOnClick,
        change: (event) =>
            setChecked(!checked, { reason: "item-press", event }),
    });
    const state = { checked, highlighted: item.highlighted, disabled };
    const consumer = disabled ? props : { ...props, onClick };
    return (
        <MenuCheckboxItemContext.Provider value={state}>
            {renderElement(
                "div",
                { ...consumer, children },
                state,
                {
                    role: "menuitemcheckbox",
                    tabIndex: -1,
                    "aria-checked": checked ? "true" : "false",
                    "aria-disabled": disabled ? "true" : undefined,
                    "data-primitives-part": `${context.component}-checkbox-item`,
                    ...stateAttributes(checkedAttributes(state)),
                    ...item.handlers,
                    ...activation,
                },
                ref,
            )}
        </MenuCheckboxItemContext.Provider>
    );
}
