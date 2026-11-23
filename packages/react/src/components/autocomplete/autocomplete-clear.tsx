import type { MouseEvent as ReactMouseEvent } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { AutocompleteContext } from "./autocomplete-context.ts";

/** Empties the text; rendered only while there is text (spec/autocomplete.md). */
export function AutocompleteClear(props: PartProps<{ disabled: boolean }>) {
    const context = useRequiredContext(
        AutocompleteContext,
        "Autocomplete.Clear",
    );
    const { disabled } = context;
    if (context.value === "") {
        return null;
    }
    return renderElement(
        "button",
        props,
        { disabled },
        {
            type: "button",
            tabIndex: -1,
            disabled,
            "data-primitives-part": "autocomplete-clear",
            ...stateAttributes({ disabled }),
            onPointerDown: (event: PointerEvent) => event.preventDefault(),
            onClick: (event: ReactMouseEvent) => {
                context.clear("clear-press", event.nativeEvent);
                if (context.open && !context.openOnInputClick) {
                    context.setOpen(false, "input-clear", event.nativeEvent);
                }
                context.trigger?.focus();
            },
        },
        context.setClearButton,
    );
}
