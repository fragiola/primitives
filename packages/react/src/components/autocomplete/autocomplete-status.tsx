import { type PartProps, renderElement } from "../../utils/render-element.tsx";

/** A polite live region for the consumer's text (spec/autocomplete.md). */
export function AutocompleteStatus(props: PartProps<Record<string, never>>) {
    return renderElement(
        "div",
        props,
        {},
        {
            role: "status",
            "aria-live": "polite",
            "aria-atomic": "true",
            "data-primitives-part": "autocomplete-status",
        },
    );
}
