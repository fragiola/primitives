import type { ComputedRef, InjectionKey } from "vue";
import type { FieldControlBinding } from "../../composables/use-field-control.ts";

/** The state every part renders with (spec/password-input.md, "API"). */
export interface PasswordInputState {
    value: string;
    visible: boolean;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}

export interface PasswordInputContext {
    state: ComputedRef<PasswordInputState>;
    inputId: () => string;
    name: () => string | undefined;
    field: FieldControlBinding;
    /** The state attributes, for every part. */
    attributes: ComputedRef<Record<string, string>>;
    onInputText: (text: string, event: Event) => void;
    /** The VisibilityTrigger's press. */
    toggle: (event: Event) => void;
    setInput: (element: unknown) => void;
}

export const PasswordInputKey: InjectionKey<PasswordInputContext> =
    Symbol("PasswordInput");
