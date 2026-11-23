import type { MouseEvent } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    EditableContext,
    type EditableState,
    editableState,
} from "./editable-context.ts";

export type EditableCancelTriggerProps = PartProps<EditableState>;

/** Reverts the edit; `hidden` until one starts (spec/editable.md). */
export function EditableCancelTrigger(props: EditableCancelTriggerProps) {
    const context = useRequiredContext(
        EditableContext,
        "Editable.CancelTrigger",
    );
    return renderElement(
        "button",
        props,
        editableState(context),
        {
            type: "button",
            hidden: !context.editing || undefined,
            disabled: context.disabled,
            "data-primitives-part": "editable-cancel-trigger",
            ...context.attributes,
            onClick: (event: MouseEvent) =>
                context.revert("cancel-press", event.nativeEvent),
        },
        context.setCancelTriggerElement,
    );
}
