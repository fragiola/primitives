import { useId } from "react";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { AutocompleteGroupContext } from "./autocomplete-context.ts";

/** A `group` of suggestions, named by its GroupLabel (spec/autocomplete.md). */
export function AutocompleteGroup(props: PartProps<Record<string, never>>) {
    const labelId = `${useId()}-label`;
    return (
        <AutocompleteGroupContext.Provider value={{ labelId }}>
            {renderElement(
                "div",
                props,
                {},
                {
                    role: "group",
                    "aria-labelledby": labelId,
                    "data-primitives-part": "autocomplete-group",
                },
            )}
        </AutocompleteGroupContext.Provider>
    );
}
