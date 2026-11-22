import type {
    KeyboardEvent,
    KeyboardEventHandler,
    MouseEvent,
    MouseEventHandler,
    PointerEvent,
    PointerEventHandler,
} from "react";
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
    const focusable = !disabled || focusableWhenDisabled;
    const native = nativeButton
        ? {
              type: type ?? "button",
              disabled: disabled && !focusableWhenDisabled ? true : undefined,
              "aria-disabled":
                  disabled && focusableWhenDisabled ? "true" : undefined,
              tabIndex,
          }
        : {
              type,
              role: "button",
              "aria-disabled": disabled ? "true" : undefined,
              tabIndex: focusable ? (tabIndex ?? 0) : -1,
          };
    return renderElement("button", props, state, {
        ...native,
        "data-primitives-part": "button-root",
        ...stateAttributes({ disabled }),
        onClick: (event: MouseEvent<HTMLElement>) => {
            // a focusable disabled submit button does not submit
            if (disabled) {
                event.preventDefault();
                return;
            }
            onClick?.(event);
        },
        onMouseDown: (event: MouseEvent<HTMLElement>) => {
            if (!disabled) {
                onMouseDown?.(event);
            }
        },
        onPointerDown: (event: PointerEvent<HTMLElement>) => {
            if (disabled) {
                event.preventDefault();
                return;
            }
            onPointerDown?.(event);
        },
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
            if (disabled) {
                if (event.key !== "Tab") {
                    event.preventDefault();
                }
                return;
            }
            onKeyDown?.(event);
            if (
                nativeButton ||
                event.defaultPrevented ||
                event.target !== event.currentTarget
            ) {
                return;
            }
            // a native button's keys: Enter clicks on key down; Space waits for its key up,
            // and its key down does not scroll the page
            if (event.key === " ") {
                event.preventDefault();
            } else if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.click();
            }
        },
        onKeyUp: (event: KeyboardEvent<HTMLElement>) => {
            if (disabled) {
                return;
            }
            onKeyUp?.(event);
            if (
                !nativeButton &&
                !event.defaultPrevented &&
                event.target === event.currentTarget &&
                event.key === " "
            ) {
                event.currentTarget.click();
            }
        },
    });
}
