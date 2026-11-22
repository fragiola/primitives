import { useContext, useMemo } from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { MenuContext, MenuRadioGroupContext } from "./menu-context.ts";

export interface MenuRadioGroupProps extends PartProps<{ disabled: boolean }> {
    /** The checked RadioItem's value; `null` for none (controlled). */
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string | null, details: ChangeDetails) => void;
    /** Disables every RadioItem of the group. */
    disabled?: boolean;
}

/** A `group` of RadioItems holding their value (spec/menu.md). */
export function MenuRadioGroup({
    value: valueProp,
    defaultValue = null,
    onValueChange,
    disabled = false,
    children,
    ...props
}: MenuRadioGroupProps) {
    const component = useContext(MenuContext)?.component ?? "menu";
    const [value, setValue] = useControllableState<
        string | null,
        ChangeDetails
    >(valueProp, defaultValue, onValueChange);
    const group = useMemo(
        () => ({
            value,
            disabled,
            setValue: (next: string, event: Event) =>
                setValue(next, { reason: "item-press", event }),
        }),
        [value, disabled, setValue],
    );
    return (
        <MenuRadioGroupContext.Provider value={group}>
            {renderElement(
                "div",
                { ...props, children },
                { disabled },
                {
                    role: "group",
                    "data-primitives-part": `${component}-radio-group`,
                    ...stateAttributes({ disabled }),
                },
            )}
        </MenuRadioGroupContext.Provider>
    );
}
