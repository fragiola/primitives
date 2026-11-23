import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    EditableContext,
    type EditableState,
    editableState,
} from "./editable-context.ts";

export type EditableAreaProps = PartProps<EditableState>;

/** Holds the Preview and the Input (spec/editable.md). */
export function EditableArea(props: EditableAreaProps) {
    const context = useRequiredContext(EditableContext, "Editable.Area");
    return renderElement("div", props, editableState(context), {
        "data-primitives-part": "editable-area",
        ...context.attributes,
    });
}
