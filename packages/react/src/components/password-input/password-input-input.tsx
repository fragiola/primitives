import type { ChangeEvent } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    PasswordInputContext,
    type PasswordInputState,
    passwordInputState,
} from "./password-input-context.ts";

export type PasswordInputInputProps = PartProps<PasswordInputState>;

/** The text field: `type="password"`, or `"text"` while visible (spec/password-input.md). */
export function PasswordInputInput(props: PasswordInputInputProps) {
    const context = useRequiredContext(
        PasswordInputContext,
        "PasswordInput.Input",
    );
    const { field } = context;
    return renderElement(
        "input",
        props,
        passwordInputState(context),
        {
            id: context.inputId,
            type: context.visible ? "text" : "password",
            name: context.name,
            value: context.value,
            disabled: context.disabled,
            readOnly: context.readOnly,
            required: context.required,
            autoCapitalize: "off",
            spellCheck: "false",
            ...field.aria,
            "data-primitives-part": "password-input-input",
            ...context.attributes,
            ...field.attributes,
            onChange: (event: ChangeEvent<HTMLInputElement>) =>
                context.onInputText(
                    event.currentTarget.value,
                    event.nativeEvent,
                ),
            onFocus: field.onFocus,
            onBlur: field.onBlur,
        },
        (element: HTMLElement | null) =>
            context.setInputElement(element as HTMLInputElement | null),
    );
}
