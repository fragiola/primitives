import type { ComputedRef, InjectionKey } from "vue";
import type { FieldControlBinding } from "../../composables/use-field-control.ts";

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

export interface EditableContext {
    state: ComputedRef<EditableState>;
    inputId: () => string;
    name: () => string | undefined;
    placeholder: () => string | undefined;
    maxLength: () => number | undefined;
    activationMode: () => EditableActivationMode;
    submitMode: () => EditableSubmitMode;
    field: FieldControlBinding;
    /** The state attributes, for every part. */
    attributes: ComputedRef<Record<string, string>>;
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
    setInput: (element: unknown) => void;
    setPreview: (element: unknown) => void;
    setEditTrigger: (element: unknown) => void;
    setSubmitTrigger: (element: unknown) => void;
    setCancelTrigger: (element: unknown) => void;
}

export const EditableKey: InjectionKey<EditableContext> = Symbol("Editable");
