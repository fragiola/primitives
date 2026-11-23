import type {
    KeyboardEventHandler,
    MouseEventHandler,
    PointerEventHandler,
} from "react";
import { buttonProps } from "../../utils/button-props.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";

export interface ButtonState {
    disabled: boolean;
}

export interface ButtonProps extends PartProps<ButtonState> {
    /** The button ignores presses and keys. */
    disabled?: boolean;
    /** A disabled button stays in the tab order and focusable (Base UI). */
    focusableWhenDisabled?: boolean;
    /**
     * Whether the rendered element is a native `<button>` (default `true`). `false` when `render`
     * gives another element: the Button adds `role="button"`, the tab order and the keys.
     */
    nativeButton?: boolean;
    /** Forwarded; a native Button is `type="button"` unless given. */
    type?: "button" | "submit" | "reset";
    tabIndex?: number;
    onClick?: MouseEventHandler<HTMLElement>;
    onMouseDown?: MouseEventHandler<HTMLElement>;
    onPointerDown?: PointerEventHandler<HTMLElement>;
    onKeyDown?: KeyboardEventHandler<HTMLElement>;
    onKeyUp?: KeyboardEventHandler<HTMLElement>;
}

/**
 * An element that performs an action (spec/button.md, the APG button): a native `<button>`, or
 * the consumer's element with the keys a native button has. While disabled, no press, pointer
 * down or key but Tab reaches the consumer's handlers.
 */
export function Button({
    disabled = false,
    focusableWhenDisabled = false,
    nativeButton = true,
    type,
    tabIndex,
    onClick,
    onMouseDown,
    onPointerDown,
    onKeyDown,
    onKeyUp,
    ...props
}: ButtonProps) {
    const state = { disabled };
    return renderElement("button", props, state, {
        ...buttonProps({
            disabled,
            focusableWhenDisabled,
            nativeButton,
            type,
            tabIndex,
            onClick,
            onMouseDown,
            onPointerDown,
            onKeyDown,
            onKeyUp,
        }),
        "data-primitives-part": "button-root",
        ...stateAttributes({ disabled }),
    });
}
