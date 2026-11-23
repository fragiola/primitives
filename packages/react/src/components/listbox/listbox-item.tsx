import { type MouseEvent, useId, useLayoutEffect } from "react";
import { useElement } from "../../hooks/use-element.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ListboxContext, ListboxItemContext } from "./listbox-context.ts";

export interface ListboxItemState {
    selected: boolean;
    highlighted: boolean;
    disabled: boolean;
}

export interface ListboxItemProps extends PartProps<ListboxItemState> {
    /** The value it selects. */
    value: string;
    /** Takes focus, never the selection. */
    disabled?: boolean;
    /** The text typeahead matches (default: its text content). */
    label?: string;
}

/** An `option`, focusable with a roving `tabindex` (spec/listbox.md). */
export function ListboxItem({
    value,
    disabled: disabledProp = false,
    label,
    ...props
}: ListboxItemProps) {
    const context = useRequiredContext(ListboxContext, "Listbox.Item");
    const [element, ref] = useElement<HTMLElement>();
    const id = useId();
    const { register } = context;
    useLayoutEffect(
        () =>
            element === null
                ? undefined
                : register({ element, value, label, disabled: disabledProp }),
        [element, value, label, disabledProp, register],
    );
    const disabled = disabledProp || context.disabled;
    const selected = context.selected.includes(value);
    const highlighted = element !== null && context.highlighted === element;
    const state = { selected, highlighted, disabled };
    return (
        <ListboxItemContext.Provider value={{ selected }}>
            {renderElement(
                "div",
                props,
                state,
                {
                    role: "option",
                    id,
                    // a disabled list's options take no focus at all
                    tabIndex: context.disabled
                        ? undefined
                        : element !== null && context.tabStop === element
                          ? 0
                          : -1,
                    "aria-selected": selected ? "true" : "false",
                    "aria-disabled": disabled ? "true" : undefined,
                    "data-primitives-part": "listbox-item",
                    ...stateAttributes({ selected, highlighted, disabled }),
                    onFocus: () => {
                        if (element !== null) {
                            context.focused(element);
                        }
                    },
                    // a Shift press selects a range, not the page's text
                    onMouseDown: (event: MouseEvent) => {
                        if (event.shiftKey) {
                            event.preventDefault();
                        }
                    },
                    onClick: (event: MouseEvent) => {
                        if (element !== null) {
                            context.press(element, event.nativeEvent);
                        }
                    },
                },
                ref,
            )}
        </ListboxItemContext.Provider>
    );
}
