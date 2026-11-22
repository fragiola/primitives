import { useElement } from "../../hooks/use-element.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    checkedAttributes,
    type MenuCheckableItemState,
    MenuContext,
    MenuRadioGroupContext,
    MenuRadioItemContext,
} from "./menu-context.ts";
import { useCheckableItem } from "./use-checkable-item.ts";
import { useMenuItem } from "./use-menu-item.ts";

export type MenuRadioItemState = MenuCheckableItemState;

export interface MenuRadioItemProps extends PartProps<MenuRadioItemState> {
    value: string;
    disabled?: boolean;
    /** The text typeahead matches (default: the item's text). */
    label?: string;
    /** A click closes every menu level (default `false`; Enter always closes, Space never). */
    closeOnClick?: boolean;
}

/** A `menuitemradio` of its RadioGroup (spec/menu.md): checks its value. */
export function MenuRadioItem({
    value,
    disabled: disabledProp = false,
    label,
    closeOnClick = false,
    onClick,
    children,
    ...props
}: MenuRadioItemProps) {
    const context = useRequiredContext(MenuContext, "Menu.RadioItem");
    const group = useRequiredContext(MenuRadioGroupContext, "Menu.RadioItem");
    const [element, ref] = useElement<HTMLElement>();
    const item = useMenuItem(context, element, label, false);
    const disabled = disabledProp || group.disabled;
    const checked = group.value === value;
    const activation = useCheckableItem(context, {
        disabled,
        closeOnClick,
        change: (event) => group.setValue(value, event),
    });
    const state = { checked, highlighted: item.highlighted, disabled };
    const consumer = disabled ? props : { ...props, onClick };
    return (
        <MenuRadioItemContext.Provider value={state}>
            {renderElement(
                "div",
                { ...consumer, children },
                state,
                {
                    role: "menuitemradio",
                    tabIndex: -1,
                    "aria-checked": checked ? "true" : "false",
                    "aria-disabled": disabled ? "true" : undefined,
                    "data-primitives-part": `${context.component}-radio-item`,
                    ...stateAttributes(checkedAttributes(state)),
                    ...item.handlers,
                    ...activation,
                },
                ref,
            )}
        </MenuRadioItemContext.Provider>
    );
}
