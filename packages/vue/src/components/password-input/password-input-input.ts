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

/** The text field: `type="password"`, or `"text"` while visible (spec/password-input.md). */
export const PasswordInputInput: PartComponent<
    Record<never, never>,
    PasswordInputState
> = publicComponent(
    defineComponent({
        name: "PasswordInputInput",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                PasswordInputKey,
                "PasswordInput.Input",
            );
            const { field } = context;
            return () => {
                const state = context.state.value;
                return renderPart("input", { attrs, slots }, props.as, state, {
                    id: context.inputId(),
                    type: state.visible ? "text" : "password",
                    name: context.name(),
                    value: state.value,
                    disabled: state.disabled,
                    readonly: state.readOnly,
                    required: state.required,
                    autocapitalize: "off",
                    spellcheck: "false",
                    ...field.aria(),
                    "data-primitives-part": "password-input-input",
                    ...context.attributes.value,
                    ...field.attributes(),
                    onInput: (event: Event) =>
                        context.onInputText(
                            (event.target as HTMLInputElement).value,
                            event,
                        ),
                    onFocus: field.onFocus,
                    onBlur: field.onBlur,
                    ref: context.setInput,
                });
            };
        },
    }),
);
