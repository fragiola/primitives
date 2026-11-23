import type { KeyboardEvent } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    EditableContext,
    type EditableState,
    editableState,
} from "./editable-context.ts";

export type EditablePreviewProps = Omit<PartProps<EditableState>, "children">;

/**
 * The value as text (or the placeholder); `hidden` while editing; its focus, press or double
 * press starts an edit, as `activationMode` says (spec/editable.md, "Pointer").
 */
export function EditablePreview(props: EditablePreviewProps) {
    const context = useRequiredContext(EditableContext, "Editable.Preview");
    const { activationMode, editing, empty, placeholder } = context;
    const interactive = !context.disabled && !context.readOnly;
    const showsPlaceholder = empty && placeholder !== undefined;
    return renderElement(
        "span",
        {
            ...props,
            children: showsPlaceholder ? placeholder : context.value,
        },
        editableState(context),
        {
            hidden: editing || undefined,
            tabIndex: interactive
                ? activationMode === "focus"
                    ? 0
                    : -1
                : undefined,
            "data-primitives-part": "editable-preview",
            ...context.attributes,
            ...stateAttributes({ placeholder: showsPlaceholder }),
            onFocus: () => context.onPreviewFocus(),
            onClick: () => {
                if (activationMode === "click") {
                    context.edit();
                }
            },
            onDoubleClick: () => {
                if (activationMode === "dblclick") {
                    context.edit();
                }
            },
            onKeyDown: (event: KeyboardEvent) => {
                if (event.key === "Enter" && activationMode !== "none") {
                    event.preventDefault();
                    context.edit();
                }
            },
        },
        context.setPreviewElement,
    );
}
