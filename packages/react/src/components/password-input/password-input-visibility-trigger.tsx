import type { MouseEvent } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    PasswordInputContext,
    type PasswordInputState,
    passwordInputState,
} from "./password-input-context.ts";

export type PasswordInputVisibilityTriggerProps = PartProps<PasswordInputState>;

/**
 * The toggle button that shows and hides the text: `aria-pressed`, `aria-controls` the Input; a
 * pointer press leaves the focus where it was (spec/password-input.md, "Focus").
 */
export function PasswordInputVisibilityTrigger(
    props: PasswordInputVisibilityTriggerProps,
) {
    const context = useRequiredContext(
        PasswordInputContext,
        "PasswordInput.VisibilityTrigger",
    );
    return renderElement("button", props, passwordInputState(context), {
        type: "button",
        "aria-pressed": context.visible ? "true" : "false",
        "aria-controls": context.inputId,
        disabled: context.disabled,
        "data-primitives-part": "password-input-visibility-trigger",
        ...context.attributes,
        onMouseDown: (event: MouseEvent) => event.preventDefault(),
        onClick: (event: MouseEvent) => context.toggle(event.nativeEvent),
    });
}
