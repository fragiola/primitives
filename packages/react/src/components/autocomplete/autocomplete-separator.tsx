import { type PartProps, renderElement } from "../../utils/render-element.tsx";

/** Between groups; no role of its own (a `listbox` owns only groups and options). */
export function AutocompleteSeparator(props: PartProps<Record<string, never>>) {
    return renderElement(
        "div",
        props,
        {},
        {
            role: "presentation",
            "data-orientation": "horizontal",
            "data-primitives-part": "autocomplete-separator",
        },
    );
}
