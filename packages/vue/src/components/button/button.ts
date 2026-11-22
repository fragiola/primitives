import { defineComponent, type PropType } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";

export interface ButtonState {
    disabled: boolean;
}

export interface ButtonProps {
    /** The button ignores presses and keys. */
    disabled?: boolean;
    /** A disabled button stays in the tab order and focusable (Base UI). */
    focusableWhenDisabled?: boolean;
    /**
     * Whether the rendered element is a native `<button>` (default `true`). `false` when `as` or
     * the `render` slot gives another element: the Button adds `role="button"`, the tab order and
     * the keys.
     */
    nativeButton?: boolean;
    /** Forwarded; a native Button is `type="button"` unless given. */
    type?: "button" | "submit" | "reset";
}

/** The consumer's listeners the Button runs itself, so that none runs while it is disabled. */
const GUARDED = [
    "onClick",
    "onMousedown",
    "onPointerdown",
    "onKeydown",
    "onKeyup",
    "tabindex",
    "tabIndex",
] as const;

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
 * An element that performs an action (spec/button.md, the APG button): a native `<button>`, or
 * the consumer's element with the keys a native button has. While disabled, no press, pointer
 * down or key but Tab reaches the consumer's listeners.
 */
export const Button: PartComponent<ButtonProps, ButtonState> = publicComponent(
    defineComponent({
        name: "ButtonRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            disabled: { type: Boolean, default: false },
            focusableWhenDisabled: { type: Boolean, default: false },
            nativeButton: { type: Boolean, default: true },
            type: {
                type: String as PropType<"button" | "submit" | "reset">,
                default: undefined,
            },
        },
        setup(props, { attrs, slots }) {
            return () => {
                const {
                    onClick,
                    onMousedown,
                    onPointerdown,
                    onKeydown,
                    onKeyup,
                    tabindex,
                    tabIndex,
                    ...rest
                } = attrs as Record<(typeof GUARDED)[number], unknown> &
                    Record<string, unknown>;
                const disabled = props.disabled;
                const focusable = !disabled || props.focusableWhenDisabled;
                const ownTabIndex = tabindex ?? tabIndex;
                const native = props.nativeButton
                    ? {
                          type: props.type ?? "button",
                          disabled:
                              disabled && !props.focusableWhenDisabled
                                  ? true
                                  : undefined,
                          "aria-disabled":
                              disabled && props.focusableWhenDisabled
                                  ? "true"
                                  : undefined,
                          tabindex: ownTabIndex,
                      }
                    : {
                          type: props.type,
                          role: "button",
                          "aria-disabled": disabled ? "true" : undefined,
                          tabindex: focusable ? (ownTabIndex ?? 0) : -1,
                      };
                return renderPart(
                    "button",
                    { attrs: rest, slots },
                    props.as,
                    { disabled },
                    {
                        ...native,
                        "data-primitives-part": "button-root",
                        ...stateAttributes({ disabled }),
                        onClick: (event: MouseEvent) => {
                            // a focusable disabled submit button does not submit
                            if (disabled) {
                                event.preventDefault();
                                return;
                            }
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
                                if (event.key !== "Tab") {
                                    event.preventDefault();
                                }
                                return;
                            }
                            run(onKeydown, event);
                            if (
                                props.nativeButton ||
                                event.defaultPrevented ||
                                event.target !== event.currentTarget
                            ) {
                                return;
                            }
                            // a native button's keys: Enter clicks on key down; Space waits for
                            // its key up, and its key down does not scroll the page
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
                                !props.nativeButton &&
                                !event.defaultPrevented &&
                                event.target === event.currentTarget &&
                                event.key === " "
                            ) {
                                (event.currentTarget as HTMLElement).click();
                            }
                        },
                    },
                );
            };
        },
    }),
);
