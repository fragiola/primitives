import { type PartProps, renderElement } from "../../utils/render-element.tsx";

/** The text of an Item that is its label (spec/select.md). */
export function SelectItemText(props: PartProps<Record<string, never>>) {
    return renderElement(
        "span",
        props,
        {},
        { "data-primitives-part": "select-item-text" },
    );
}
