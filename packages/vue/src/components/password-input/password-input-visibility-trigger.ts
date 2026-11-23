import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import {
    PasswordInputKey,
    type PasswordInputState,
} from "./password-input-context.ts";

/**
 * The toggle button that shows and hides the text: `aria-pressed`, `aria-controls` the Input; a
 * pointer press leaves the focus where it was (spec/password-input.md, "Focus").
 */
export const PasswordInputVisibilityTrigger: PartComponent<
    Record<never, never>,
    PasswordInputState
> = publicComponent(
    defineComponent({
        name: "PasswordInputVisibilityTrigger",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                PasswordInputKey,
                "PasswordInput.VisibilityTrigger",
            );
            return () => {
                const state = context.state.value;
                return renderPart("button", { attrs, slots }, props.as, state, {
                    type: "button",
                    "aria-pressed": state.visible ? "true" : "false",
                    "aria-controls": context.inputId(),
                    disabled: state.disabled,
                    "data-primitives-part": "password-input-visibility-trigger",
                    ...context.attributes.value,
                    onMousedown: (event: MouseEvent) => event.preventDefault(),
                    onClick: (event: MouseEvent) => context.toggle(event),
                });
            };
        },
    }),
);
