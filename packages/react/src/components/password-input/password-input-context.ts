import { createContext } from "react";
import type { FieldControlBinding } from "../../hooks/use-field-control.ts";

/** The state every part renders with (spec/password-input.md, "API"). */
export interface PasswordInputState {
    value: string;
    visible: boolean;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}

export interface PasswordInputContextValue extends PasswordInputState {
    inputId: string;
    name: string | undefined;
    field: FieldControlBinding;
    /** The state attributes, for every part. */
    attributes: Record<`data-${string}`, string>;
    onInputText: (text: string, event: Event) => void;
    /** The VisibilityTrigger's press. */
    toggle: (event: Event) => void;
    setInputElement: (element: HTMLInputElement | null) => void;
}

export const PasswordInputContext =
    createContext<PasswordInputContextValue | null>(null);

export function passwordInputState(
    context: PasswordInputContextValue,
): PasswordInputState {
    return {
        value: context.value,
        visible: context.visible,
        disabled: context.disabled,
        readOnly: context.readOnly,
        required: context.required,
    };
}
