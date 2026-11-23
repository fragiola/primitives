import type { MouseEvent } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    EditableContext,
    type EditableState,
    editableState,
} from "./editable-context.ts";

export type EditableSubmitTriggerProps = PartProps<EditableState>;

/** Commits the edit; `hidden` until one starts (spec/editable.md). */
export function EditableSubmitTrigger(props: EditableSubmitTriggerProps) {
    const context = useRequiredContext(
        EditableContext,
        "Editable.SubmitTrigger",
    );
    return renderElement(
        "button",
        props,
        editableState(context),
        {
            type: "button",
            hidden: !context.editing || undefined,
            disabled: context.disabled,
            "data-primitives-part": "editable-submit-trigger",
            ...context.attributes,
            onClick: (event: MouseEvent) =>
                context.commit("submit-press", event.nativeEvent),
        },
        context.setSubmitTriggerElement,
    );
}
