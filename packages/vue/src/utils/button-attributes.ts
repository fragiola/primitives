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
    /** A roving composite's `tabindex` (a toolbar's item); the consumer's otherwise. */
    tabIndex?: number | undefined;
    /**
     * An item of a roving composite (a toolbar's button): while disabled and focusable, the
     * composite's keys still reach the composite (spec/toolbar.md, "Disabled items").
     */
    composite?: boolean;
    /** Runs on a click before the consumer's listeners, never while disabled (a Toggle's press). */
    onPress?: (event: MouseEvent) => void;
}

/** Runs a listener attribute: a function, or the array Vue merges several into. */
function run(listener: unknown, event: Event) {
    if (typeof listener === "function") {
        listener(event);
    } else if (Array.isArray(listener)) {
        for (const entry of listener) {
            run(entry, event);
        }
    }
}

/**
 * A button's attributes and listeners (spec/button.md), shared by Button, Toggle and
 * Toolbar.Button (the package's own code, not the `/button` entry): a native `<button>`, or the
 * consumer's element with the keys a native button has. The consumer's click, pointer and key
 * listeners (and its `tabindex`) are taken out of `attrs` and run by the button itself, so that
 * none runs while it is disabled; no key but Tab (and a composite's keys) passes then.
 */
export function buttonAttributes(
    behaviour: ButtonBehaviour,
    attrs: Record<string, unknown>,
): {
    /** The consumer's other attributes, merged on the element as usual. */
    rest: Record<string, unknown>;
    /** The button's attributes and listeners. */
    internal: Record<string, unknown>;
} {
    const {
        onClick,
        onMousedown,
        onPointerdown,
        onKeydown,
        onKeyup,
        tabindex,
        tabIndex,
        ...rest
    } = attrs;
    const {
        disabled,
        focusableWhenDisabled,
        nativeButton,
        type,
        composite = false,
        onPress,
    } = behaviour;
    const focusable = !disabled || focusableWhenDisabled;
    const ownTabIndex = behaviour.tabIndex ?? tabindex ?? tabIndex;
    const native = nativeButton
        ? {
              type: type ?? "button",
              disabled: disabled && !focusableWhenDisabled ? true : undefined,
              "aria-disabled":
                  disabled && focusableWhenDisabled ? "true" : undefined,
              tabindex: ownTabIndex,
          }
        : {
              type,
              role: "button",
              "aria-disabled": disabled ? "true" : undefined,
              tabindex: focusable ? (ownTabIndex ?? 0) : -1,
          };
    return {
        rest,
        internal: {
            ...native,
            onClick: (event: MouseEvent) => {
                // a focusable disabled submit button does not submit
                if (disabled) {
                    event.preventDefault();
                    return;
                }
                onPress?.(event);
                run(onClick, event);
            },
            onMousedown: (event: MouseEvent) => {
                if (!disabled) {
                    run(onMousedown, event);
                }
            },
            onPointerdown: (event: PointerEvent) => {
                if (disabled) {
                    event.preventDefault();
                    return;
                }
                run(onPointerdown, event);
            },
            onKeydown: (event: KeyboardEvent) => {
                if (disabled) {
                    if (
                        event.key !== "Tab" &&
                        !(composite && COMPOSITE_KEYS.includes(event.key))
                    ) {
                        event.preventDefault();
                    }
                    return;
                }
                run(onKeydown, event);
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
                    (event.currentTarget as HTMLElement).click();
                }
            },
            onKeyup: (event: KeyboardEvent) => {
                if (disabled) {
                    return;
                }
                run(onKeyup, event);
                if (
                    !nativeButton &&
                    !event.defaultPrevented &&
                    event.target === event.currentTarget &&
                    event.key === " "
                ) {
                    (event.currentTarget as HTMLElement).click();
                }
            },
        },
    };
}
