import { createContext } from "react";
import type { FieldControlBinding } from "../../hooks/use-field-control.ts";

/** What starts an edit on the Preview (spec/editable.md, "API"). */
export type EditableActivationMode = "focus" | "click" | "dblclick" | "none";

/** What commits an edit. */
export type EditableSubmitMode = "enter" | "blur" | "both" | "none";

/** The state every part renders with. */
export interface EditableState {
    value: string;
    editing: boolean;
    empty: boolean;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}

export interface EditableContextValue extends EditableState {
    inputId: string;
    name: string | undefined;
    placeholder: string | undefined;
    maxLength: number | undefined;
    activationMode: EditableActivationMode;
    submitMode: EditableSubmitMode;
    field: FieldControlBinding;
    /** The state attributes, for every part. */
    attributes: Record<`data-${string}`, string>;
    /** Starts an edit (the Preview's activations, the EditTrigger). */
    edit: () => void;
    /** The Preview took the focus: starts an edit in `"focus"` mode, unless it is a focus return. */
    onPreviewFocus: () => void;
    commit: (
        reason: "keyboard" | "submit-press",
        event: Event | undefined,
    ) => void;
    revert: (
        reason: "escape-key" | "cancel-press",
        event: Event | undefined,
    ) => void;
    onInputText: (text: string, event: Event) => void;
    /** The focus left a part of the Root: an edit ends once it is outside the edit's parts. */
    onFocusOut: (event: FocusEvent) => void;
    setInputElement: (element: HTMLElement | null) => void;
    setPreviewElement: (element: HTMLElement | null) => void;
    setEditTriggerElement: (element: HTMLElement | null) => void;
    setSubmitTriggerElement: (element: HTMLElement | null) => void;
    setCancelTriggerElement: (element: HTMLElement | null) => void;
}

export const EditableContext = createContext<EditableContextValue | null>(null);

export function editableState(context: EditableContextValue): EditableState {
    return {
        value: context.value,
        editing: context.editing,
        empty: context.empty,
        disabled: context.disabled,
        readOnly: context.readOnly,
        required: context.required,
    };
}
