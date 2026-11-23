import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    EditableContext,
    type EditableState,
    editableState,
} from "./editable-context.ts";

export type EditableEditTriggerProps = PartProps<EditableState>;

/** Starts an edit; `hidden` while editing (spec/editable.md). */
export function EditableEditTrigger(props: EditableEditTriggerProps) {
    const context = useRequiredContext(EditableContext, "Editable.EditTrigger");
    return renderElement(
        "button",
        props,
        editableState(context),
        {
            type: "button",
            hidden: context.editing || undefined,
            disabled: context.disabled || context.readOnly,
            "aria-controls": context.inputId,
            "data-primitives-part": "editable-edit-trigger",
            ...context.attributes,
            onClick: () => context.edit(),
        },
        context.setEditTriggerElement,
    );
}
