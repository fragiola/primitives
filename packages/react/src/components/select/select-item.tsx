import { scrollIntoViewWithin } from "@fragiola/primitives/collection";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useLayoutEffect, useRef } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { SelectContext, SelectItemContext } from "./select-context.ts";

export interface SelectItemState {
    highlighted: boolean;
    selected: boolean;
    disabled: boolean;
}

export interface SelectItemProps extends PartProps<SelectItemState> {
    value: string;
    /**
     * The label the Value shows and typeahead matches, without the Root's `items` (default: its
     * ItemText's text, else its text content).
     */
    label?: string;
    /** Can be highlighted, never chosen (default: the Root item's `disabled`). */
    disabled?: boolean;
}

/** An `option` (spec/select.md). */
export function SelectItem({
    value,
    disabled: disabledProp,
    label,
    ...props
}: SelectItemProps) {
    const context = useRequiredContext(SelectContext, "Select.Item");
    const element = useRef<HTMLElement | null>(null);
    const disabled =
        disabledProp ??
        context.items.find((item) => item.value === value)?.disabled ??
        false;
    const highlighted = context.highlighted === value;
    const selected = context.value === value;
    const { positioner, registerItem } = context;
    // without `items`: registers its value, label and disabled state, read once rendered
    const registration = useRef<{
        label: string;
        disabled: boolean;
        unregister: () => void;
    } | null>(null);
    useLayoutEffect(() => {
        const node = element.current;
        if (registerItem === null || node === null) {
            return;
        }
        const text = node.querySelector(
            '[data-primitives-part="select-item-text"]',
        );
        const current = (label ?? (text ?? node).textContent ?? "").trim();
        const own = disabledProp ?? false;
        const previous = registration.current;
        if (previous?.label === current && previous.disabled === own) {
            return;
        }
        previous?.unregister();
        registration.current = {
            label: current,
            disabled: own,
            unregister: registerItem({
                value,
                label: current,
                disabled: own,
                element: node,
            }),
        };
    });
    useLayoutEffect(
        () => () => {
            registration.current?.unregister();
            registration.current = null;
        },
        [],
    );
    // within the popup only: a list that mounts before it is placed never scrolls the page
    useLayoutEffect(() => {
        if (highlighted && element.current !== null) {
            scrollIntoViewWithin(element.current, positioner);
        }
    }, [highlighted, positioner]);
    const state = { highlighted, selected, disabled };
    return (
        <SelectItemContext.Provider value={state}>
            {renderElement(
                "div",
                props,
                state,
                {
                    role: "option",
                    id: context.itemId(value),
                    "aria-selected": selected ? "true" : "false",
                    "aria-disabled": disabled ? "true" : undefined,
                    "data-primitives-part": "select-item",
                    ...stateAttributes({ highlighted, selected, disabled }),
                    onPointerMove: () => {
                        if (!highlighted) {
                            context.setHighlighted(value);
                        }
                    },
                    // the trigger keeps DOM focus
                    onPointerDown: (event: PointerEvent) =>
                        event.preventDefault(),
                    onClick: (event: ReactMouseEvent) => {
                        if (!disabled) {
                            context.choose(
                                value,
                                "item-press",
                                event.nativeEvent,
                            );
                        }
                    },
                },
                (node: HTMLElement | null) => {
                    element.current = node;
                },
            )}
        </SelectItemContext.Provider>
    );
}
