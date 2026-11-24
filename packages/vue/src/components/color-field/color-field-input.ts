import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { ColorFieldKey, type ColorFieldState } from "./color-field-context.ts";

/**
 * The text: a textbox (hex), or a `spinbutton` with `channel` (spec/color-field.md); Enter and
 * blur commit it, the arrows step it.
 */
export const ColorFieldInput: PartComponent<
    Record<never, never>,
    ColorFieldState
> = publicComponent(
    defineComponent({
        name: "ColorFieldInput",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                ColorFieldKey,
                "ColorField.Input",
            );
            const onKeydown = (event: KeyboardEvent) => {
                if (event.key === "Enter") {
                    context.commitText("keyboard", event);
                    return;
                }
                if (context.stepKey(event.key, event.shiftKey, event)) {
                    event.preventDefault();
                }
            };
            const onInput = (event: Event) => {
                context.onInputText((event.target as HTMLInputElement).value);
            };
            return () => {
                const state = context.state.value;
                const { disabled, readOnly, required } = state;
                const channelMode = context.channel() !== undefined;
                const range = context.range();
                const { field } = context;
                return renderPart("input", { attrs, slots }, props.as, state, {
                    id: context.inputId(),
                    type: "text",
                    role: channelMode ? "spinbutton" : undefined,
                    inputmode: channelMode ? "decimal" : undefined,
                    autocomplete: "off",
                    autocorrect: "off",
                    spellcheck: "false",
                    value: state.inputValue,
                    disabled,
                    readonly: readOnly,
                    "aria-valuenow": channelMode
                        ? (context.channelValue.value ?? undefined)
                        : undefined,
                    "aria-valuemin": channelMode ? range?.min : undefined,
                    "aria-valuemax": channelMode ? range?.max : undefined,
                    "aria-valuetext":
                        channelMode && state.value !== null
                            ? context.valueText.value
                            : undefined,
                    "aria-required": required ? "true" : undefined,
                    "aria-readonly": readOnly ? "true" : undefined,
                    ...field.aria(),
                    "data-primitives-part": "color-field-input",
                    ...context.attributes(),
                    onInput,
                    onKeydown,
                    onFocus: field.onFocus,
                    onBlur: (event: FocusEvent) => {
                        context.commitText("input-blur", event);
                        field.onBlur();
                    },
                    ref: context.setInputElement,
                });
            };
        },
    }),
);
