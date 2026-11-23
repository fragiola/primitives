import { defineComponent, nextTick, shallowRef, watch } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import {
    NumberFieldKey,
    type NumberFieldState,
} from "./number-field-context.ts";

/** The `spinbutton`: a text input with the formatted value (spec/number-field.md, the APG). */
export const NumberFieldInput: PartComponent<
    Record<never, never>,
    NumberFieldState
> = publicComponent(
    defineComponent({
        name: "NumberFieldInput",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                NumberFieldKey,
                "NumberField.Input",
            );
            const element = shallowRef<HTMLInputElement | null>(null);
            const setElement = (value: unknown) => {
                context.setInputElement(value);
                const next =
                    value instanceof HTMLInputElement
                        ? value
                        : ((value as { $el?: HTMLInputElement } | null)?.$el ??
                          null);
                if (element.value !== next) {
                    element.value = next;
                }
            };

            // the wheel over the focused Input steps it, and the page does not scroll (a
            // non-passive listener)
            watch(
                [element, context.allowWheelScrub],
                ([input, allowed], _, onCleanup) => {
                    if (input === null || !allowed) {
                        return;
                    }
                    const onWheel = (event: WheelEvent) => {
                        if (
                            input.ownerDocument.activeElement !== input ||
                            event.deltaY === 0
                        ) {
                            return;
                        }
                        const { disabled, readOnly } = context.state.value;
                        if (disabled || readOnly) {
                            return;
                        }
                        event.preventDefault();
                        const amount = context.amount(event);
                        context.stepBy(
                            event.deltaY < 0 ? amount : -amount,
                            "wheel",
                            event,
                        );
                    };
                    input.addEventListener("wheel", onWheel, {
                        passive: false,
                    });
                    onCleanup(() =>
                        input.removeEventListener("wheel", onWheel),
                    );
                },
                { flush: "post" },
            );

            const onKeydown = (event: KeyboardEvent) => {
                const { disabled, readOnly } = context.state.value;
                if (disabled || readOnly) {
                    return;
                }
                const amount = context.amount(event);
                const large = context.amount({ shiftKey: true });
                switch (event.key) {
                    case "ArrowUp":
                        context.stepBy(amount, "keyboard", event);
                        break;
                    case "ArrowDown":
                        context.stepBy(-amount, "keyboard", event);
                        break;
                    case "PageUp":
                        context.stepBy(large, "keyboard", event);
                        break;
                    case "PageDown":
                        context.stepBy(-large, "keyboard", event);
                        break;
                    case "Home": {
                        const min = context.min();
                        if (min === undefined) {
                            return;
                        }
                        context.stepTo(min, "keyboard", event);
                        break;
                    }
                    case "End": {
                        const max = context.max();
                        if (max === undefined) {
                            return;
                        }
                        context.stepTo(max, "keyboard", event);
                        break;
                    }
                    default:
                        return;
                }
                event.preventDefault();
            };

            const onInput = (event: Event) => {
                const input = event.target as HTMLInputElement;
                if (!context.onInputText(input.value, event)) {
                    // refused: the text stays as it was (spec/number-field.md, "Typing")
                    input.value = context.state.value.inputValue;
                }
                // a text the render does not change (a controlled value the consumer kept) is
                // re-asserted once the update rendered
                void nextTick().then(() => {
                    const text = context.state.value.inputValue;
                    if (input.value !== text) {
                        input.value = text;
                    }
                });
            };

            return () => {
                const state = context.state.value;
                const { value, disabled, readOnly, required } = state;
                const min = context.min();
                const max = context.max();
                const integer =
                    context.format()?.maximumFractionDigits === 0 &&
                    min !== undefined &&
                    min >= 0;
                const { field } = context;
                return renderPart("input", { attrs, slots }, props.as, state, {
                    id: context.inputId(),
                    type: "text",
                    role: "spinbutton",
                    inputmode: integer ? "numeric" : "decimal",
                    autocomplete: "off",
                    autocorrect: "off",
                    spellcheck: "false",
                    value: state.inputValue,
                    disabled,
                    readonly: readOnly,
                    "aria-valuenow": value ?? undefined,
                    "aria-valuemin": min,
                    "aria-valuemax": max,
                    "aria-valuetext":
                        value === null ? undefined : context.formattedValue(),
                    "aria-required": required ? "true" : undefined,
                    "aria-readonly": readOnly ? "true" : undefined,
                    ...field.aria(),
                    "data-primitives-part": "number-field-input",
                    ...context.attributes(),
                    onInput,
                    onKeydown,
                    onFocus: field.onFocus,
                    onBlur: (event: FocusEvent) => {
                        context.onInputBlur(event);
                        field.onBlur();
                    },
                    ref: setElement,
                });
            };
        },
    }),
);
