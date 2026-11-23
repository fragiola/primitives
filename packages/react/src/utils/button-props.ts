import type {
    KeyboardEvent,
    KeyboardEventHandler,
    MouseEvent,
    MouseEventHandler,
    PointerEvent,
    PointerEventHandler,
} from "react";

/** The keys a roving composite acts on (spec/toolbar.md, "Keyboard"). */
const COMPOSITE_KEYS = [
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
];

export interface ButtonBehaviour {
    disabled: boolean;
    focusableWhenDisabled: boolean;
    nativeButton: boolean;
    type: "button" | "submit" | "reset" | undefined;
    tabIndex: number | undefined;
    /**
     * An item of a roving composite (a toolbar's button): while disabled and focusable, the
     * composite's keys still reach the composite (spec/toolbar.md, "Disabled items").
     */
    composite?: boolean;
    onClick?: MouseEventHandler<HTMLElement> | undefined;
    onMouseDown?: MouseEventHandler<HTMLElement> | undefined;
    onPointerDown?: PointerEventHandler<HTMLElement> | undefined;
    onKeyDown?: KeyboardEventHandler<HTMLElement> | undefined;
    onKeyUp?: KeyboardEventHandler<HTMLElement> | undefined;
}

/**
 * A button's attributes and handlers (spec/button.md), shared by Button, Toggle and
 * Toolbar.Button (each framework's own code, not the `/button` entry): a native `<button>`, or
 * the consumer's element with the keys a native button has. While disabled, no press, pointer
 * down or key but Tab (and a composite's keys) reaches the given handlers.
 */
export function buttonProps({
    disabled,
    focusableWhenDisabled,
    nativeButton,
    type,
    tabIndex,
    composite = false,
    onClick,
    onMouseDown,
    onPointerDown,
    onKeyDown,
    onKeyUp,
}: ButtonBehaviour): Record<string, unknown> {
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
    return {
        ...native,
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
                if (
                    event.key !== "Tab" &&
                    !(composite && COMPOSITE_KEYS.includes(event.key))
                ) {
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
    };
}
