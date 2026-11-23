import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { AutocompleteContext } from "./autocomplete-context.ts";

/**
 * A polite live region, always rendered; its children are shown only while the list is empty
 * (spec/autocomplete.md).
 */
export function AutocompleteEmpty({
    children,
    ...props
}: PartProps<Record<string, never>>) {
    const context = useRequiredContext(
        AutocompleteContext,
        "Autocomplete.Empty",
    );
    const empty = context.hasItems
        ? context.entries.length === 0
        : context.itemCount === 0;
    return renderElement(
        "div",
        { ...props, children: empty ? children : null },
        {},
        {
            role: "status",
            "aria-live": "polite",
            "aria-atomic": "true",
            "data-primitives-part": "autocomplete-empty",
        },
    );
}
