import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { AutocompleteContext } from "./autocomplete-context.ts";

/** The floating container of the list (no role of its own). */
export function AutocompletePopup(
    props: PartProps<{ open: boolean; side: string; align: string }>,
) {
    const context = useRequiredContext(
        AutocompleteContext,
        "Autocomplete.Popup",
    );
    const status = context.presence.status;
    return renderElement(
        "div",
        props,
        { open: context.open, ...context.placed },
        {
            "data-primitives-part": "autocomplete-popup",
            ...stateAttributes({
                open: context.open,
                closed: !context.open,
                side: context.placed.side,
                align: context.placed.align,
                "starting-style": status === "starting",
                "ending-style": status === "ending",
            }),
        },
        context.setPopup,
    );
}
