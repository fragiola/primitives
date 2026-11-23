import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { AutocompleteGroupContext } from "./autocomplete-context.ts";

/** Names its Group. */
export function AutocompleteGroupLabel(
    props: PartProps<Record<string, never>>,
) {
    const group = useRequiredContext(
        AutocompleteGroupContext,
        "Autocomplete.GroupLabel",
    );
    return renderElement(
        "div",
        props,
        {},
        {
            id: group.labelId,
            "data-primitives-part": "autocomplete-group-label",
        },
    );
}
