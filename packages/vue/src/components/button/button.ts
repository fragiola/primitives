import { defineComponent, type PropType } from "vue";
import { buttonAttributes } from "../../utils/button-attributes.ts";
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
                const disabled = props.disabled;
                const { rest, internal } = buttonAttributes(
                    {
                        disabled,
                        focusableWhenDisabled: props.focusableWhenDisabled,
                        nativeButton: props.nativeButton,
                        type: props.type,
                    },
                    attrs,
                );
                return renderPart(
                    "button",
                    { attrs: rest, slots },
                    props.as,
                    { disabled },
                    {
                        ...internal,
                        "data-primitives-part": "button-root",
                        ...stateAttributes({ disabled }),
                    },
                );
            };
        },
    }),
);
