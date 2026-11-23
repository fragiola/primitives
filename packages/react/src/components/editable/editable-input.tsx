import type { ChangeEvent, KeyboardEvent } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    EditableContext,
    type EditableState,
    editableState,
} from "./editable-context.ts";

export type EditableInputProps = PartProps<EditableState>;

/**
 * The text field (an `input`, or the app's `textarea`): `hidden` until an edit starts; Enter
 * commits and Escape reverts (spec/editable.md, "Keyboard"); the form control.
 */
export function EditableInput(props: EditableInputProps) {
    const context = useRequiredContext(EditableContext, "Editable.Input");
    const { field, editing, submitMode } = context;
    return renderElement(
        "input",
        props,
        editableState(context),
        {
            id: context.inputId,
            name: context.name,
            value: context.value,
            hidden: !editing || undefined,
            placeholder: context.placeholder,
            maxLength: context.maxLength,
            disabled: context.disabled,
            required: context.required,
            ...field.aria,
            "data-primitives-part": "editable-input",
            ...context.attributes,
            ...field.attributes,
            onChange: (event: ChangeEvent<HTMLInputElement>) =>
                context.onInputText(
                    event.currentTarget.value,
                    event.nativeEvent,
                ),
            onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
                const native = event.nativeEvent;
                if (!editing || native.isComposing) {
                    return;
                }
                if (event.key === "Escape") {
                    event.preventDefault();
                    context.revert("escape-key", native);
                    return;
                }
                if (
                    event.key !== "Enter" ||
                    (submitMode !== "enter" && submitMode !== "both")
                ) {
                    return;
                }
                const textarea = event.currentTarget.localName === "textarea";
                if (textarea && !event.ctrlKey && !event.metaKey) {
                    return;
                }
                event.preventDefault();
                context.commit("keyboard", native);
            },
            onFocus: field.onFocus,
            onBlur: field.onBlur,
        },
        context.setInputElement,
    );
}
