import { scrollIntoViewWithin } from "@fragiola/primitives/collection";
import { type MouseEvent, useId, useLayoutEffect } from "react";
import { useElement } from "../../hooks/use-element.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { AutocompleteContext } from "./autocomplete-context.ts";

export interface AutocompleteItemState {
    highlighted: boolean;
    disabled: boolean;
}

export interface AutocompleteItemProps
    extends PartProps<AutocompleteItemState> {
    /** The suggestion: its `itemToStringValue` becomes the value when chosen. */
    value: unknown;
    /** Can be highlighted, never chosen. */
    disabled?: boolean;
}

/** An `option`: a suggestion, never selected (spec/autocomplete.md). */
export function AutocompleteItem({
    value,
    disabled = false,
    ...props
}: AutocompleteItemProps) {
    const context = useRequiredContext(
        AutocompleteContext,
        "Autocomplete.Item",
    );
    const [element, ref] = useElement<HTMLElement>();
    const id = useId();
    const { items, setItemCount } = context;
    useLayoutEffect(() => {
        if (element === null) {
            return undefined;
        }
        items.set(element, { value, disabled, id });
        setItemCount(items.size);
        return () => {
            items.delete(element);
            setItemCount(items.size);
        };
    }, [element, value, disabled, id, items, setItemCount]);

    const highlighted = context.highlighted === id;
    const { positioner } = context;
    // within the popup only: a list that mounts before it is placed never scrolls the page
    useLayoutEffect(() => {
        if (highlighted && element !== null) {
            scrollIntoViewWithin(element, positioner);
        }
    }, [highlighted, element, positioner]);

    const state = { highlighted, disabled };
    return renderElement(
        "div",
        props,
        state,
        {
            role: "option",
            id,
            "aria-disabled": disabled ? "true" : undefined,
            "data-primitives-part": "autocomplete-item",
            ...stateAttributes({ highlighted, disabled }),
            onPointerMove: () => {
                if (!highlighted) {
                    context.highlight(id, "pointer");
                }
            },
            onPointerDown: (event: PointerEvent) => event.preventDefault(),
            onClick: (event: MouseEvent) => {
                if (!disabled) {
                    context.choose(value, event.nativeEvent);
                }
            },
        },
        ref,
    );
}
