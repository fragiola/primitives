import type { MouseEvent } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { AutocompleteContext } from "./autocomplete-context.ts";

/**
 * Holds the Input and its buttons; anchors the list. A press on it, outside its buttons and the
 * input, focuses the input (and opens the list with `openOnInputClick`).
 */
export function AutocompleteInputGroup(
    props: PartProps<{ open: boolean; disabled: boolean }>,
) {
    const context = useRequiredContext(
        AutocompleteContext,
        "Autocomplete.InputGroup",
    );
    const { open, disabled } = context;
    return renderElement(
        "div",
        props,
        { open, disabled },
        {
            role: "group",
            "data-primitives-part": "autocomplete-input-group",
            ...stateAttributes({ "popup-open": open, disabled }),
            onMouseDown: (event: MouseEvent) => {
                const target = event.target as Element | null;
                if (
                    target === null ||
                    target === context.trigger ||
                    target.closest("button") !== null
                ) {
                    return;
                }
                event.preventDefault();
                if (disabled) {
                    return;
                }
                context.trigger?.focus();
                if (context.openOnInputClick && !open) {
                    context.setOpen(true, "input-press", event.nativeEvent);
                }
            },
        },
        context.setInputGroup,
    );
}
