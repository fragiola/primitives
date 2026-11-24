import {
    type Color,
    type ColorChannel,
    type ColorSpace,
    clampColorChannel,
    colorChannelFormat,
    colorChannelRange,
    colorSpaceFor,
    convertColor,
    formatColor,
    formatColorChannel,
    getColorChannel,
    isSameColor,
    parseColor,
    setColorChannel,
} from "@fragiola/primitives/color";
import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import { parseNumber } from "@fragiola/primitives/number";
import {
    computed,
    defineComponent,
    Fragment,
    h,
    type PropType,
    provide,
    ref,
    shallowRef,
    useId,
    watch,
} from "vue";
import { useColorPickerBinding } from "../../composables/use-color-picker-binding.ts";
import { useControllable } from "../../composables/use-controllable.ts";
import {
    OUTSIDE_FIELD,
    useFieldControl,
} from "../../composables/use-field-control.ts";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ColorFieldKey, type ColorFieldState } from "./color-field-context.ts";

/** A `Color`, a string `parseColor` reads (`null` when it reads none), or `null`. */
function toColor(
    value: Color | string | null | undefined,
): Color | null | undefined {
    if (value === undefined || value === null) {
        return value;
    }
    return parseColor(value);
}

/** Black in `space`: what a channel typed into an empty field is set on. */
function black(space: ColorSpace): Color {
    return convertColor(
        { space: "rgb", red: 0, green: 0, blue: 0, alpha: 1 },
        space,
    );
}

/** The 24-bit number of a color, plus `amount`, clamped, back to an rgb color. */
function stepHex(color: Color | null, amount: number): Color {
    const rgb = convertColor(color ?? black("rgb"), "rgb") as Extract<
        Color,
        { space: "rgb" }
    >;
    const number = Math.min(
        Math.max((rgb.red << 16) + (rgb.green << 8) + rgb.blue + amount, 0),
        0xffffff,
    );
    return {
        space: "rgb",
        red: (number >> 16) & 0xff,
        green: (number >> 8) & 0xff,
        blue: number & 0xff,
        alpha: rgb.alpha,
    };
}

function round2(value: number): number {
    return Math.round(value * 100) / 100 + 0;
}

export interface ColorFieldRootProps {
    /** A color (or a string `parseColor` reads), or `null` while empty (`v-model:value`). */
    value?: Color | string | null;
    defaultValue?: Color | string | null;
    /** The channel the field edits (none: the whole color, as hex). */
    channel?: ColorChannel;
    /** With `channel`, the space it edits it in. */
    colorSpace?: ColorSpace;
    /** The locale of the channel's text (BCP 47; default: the runtime's). */
    locale?: string;
    name?: string;
    /** The Input's id (generated unless given). */
    id?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
}

export type ColorFieldRootEmits = {
    "update:value": (value: Color | null) => true;
    valueChange: (value: Color | null, details: ChangeDetails) => true;
};

const COLOR_OR_NULL = [Object, String, null] as PropType<Color | string | null>;

/**
 * Holds a ColorField's value (`v-model:value`), its typed text and its hidden form input
 * (spec/color-field.md: a hex textbox, or the APG spinbutton for one channel; the text commits on
 * Enter and blur).
 */
export const ColorFieldRoot: PartComponent<
    ColorFieldRootProps,
    ColorFieldState,
    ColorFieldRootEmits
> = publicComponent(
    defineComponent({
        name: "ColorFieldRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: { type: COLOR_OR_NULL, default: undefined },
            defaultValue: { type: COLOR_OR_NULL, default: undefined },
            /** The channel the field edits (none: the whole color, as hex). */
            channel: {
                type: String as PropType<ColorChannel>,
                default: undefined,
            },
            /** With `channel`, the space it edits it in. */
            colorSpace: {
                type: String as PropType<ColorSpace>,
                default: undefined,
            },
            /** The locale of the channel's text (BCP 47; default: the runtime's). */
            locale: { type: String, default: undefined },
            name: { type: String, default: undefined },
            /** The Input's id (generated unless given). */
            id: { type: String, default: undefined },
            disabled: { type: Boolean, default: false },
            readOnly: { type: Boolean, default: false },
            required: { type: Boolean, default: false },
        },
        emits: {
            "update:value": (_value: Color | null) => true,
            valueChange: (_value: Color | null, _details: ChangeDetails) =>
                true,
        },
        setup(props, { attrs, slots, emit }) {
            const generatedId = useId();
            const inputId = () => props.id ?? generatedId;
            const report = (next: Color | null, details: ChangeDetails) => {
                emit("update:value", next);
                emit("valueChange", next, details);
            };
            const defaultValue = () => props.defaultValue ?? null;
            // inside a ColorPicker, bound to its color unless given its own (spec/color-picker.md)
            const binding = useColorPickerBinding(
                () =>
                    props.value !== undefined ||
                    props.defaultValue !== undefined,
                useControllable<Color | null, ChangeDetails>(
                    () => toColor(props.value),
                    toColor(defaultValue()) ?? null,
                    report,
                ),
                report,
            );
            const { picker, bound } = binding;
            const own = {
                value: binding.value,
                set: (next: Color | null, details: ChangeDetails) => {
                    const to = bound();
                    if (to === null) {
                        binding.set(next, details);
                        return;
                    }
                    // a bound field never commits `null`: its text goes back to the picker's
                    if (next === null) {
                        return;
                    }
                    binding.set(next, details);
                    to.commit(next, details);
                },
            };
            const space = computed<ColorSpace>(() => {
                const current = own.value.value;
                return props.channel === undefined
                    ? (current?.space ?? "rgb")
                    : colorSpaceFor(
                          props.channel,
                          current ?? black("rgb"),
                          props.colorSpace,
                      );
            });
            const value = computed(() => {
                const current = own.value.value;
                return current === null || props.channel === undefined
                    ? current
                    : convertColor(current, space.value);
            });
            const channelValue = computed(() =>
                value.value === null || props.channel === undefined
                    ? null
                    : getColorChannel(value.value, props.channel),
            );
            // the text the user typed, until a commit (`null`: the value's text)
            const typed = ref<string | null>(null);
            const input = shallowRef<HTMLElement | null>(null);
            const hidden = shallowRef<HTMLInputElement | null>(null);
            const valueText = computed(() =>
                value.value === null
                    ? ""
                    : props.channel === undefined
                      ? formatColor(value.value, "hex")
                      : formatColorChannel(
                            value.value,
                            props.channel,
                            props.locale,
                        ),
            );
            const formValue = computed(() =>
                value.value === null
                    ? ""
                    : props.channel === undefined
                      ? formatColor(value.value, "hex")
                      : String(channelValue.value),
            );
            // inside a ColorPicker, the picker is the field's control: the control reads none
            const field =
                picker !== null
                    ? OUTSIDE_FIELD
                    : useFieldControl({
                          id: inputId,
                          labelable: true,
                          value: () =>
                              formValue.value === "" ? null : formValue.value,
                          filled: () => value.value !== null,
                          input: () => hidden.value,
                          focusTarget: () => input.value,
                      });
            const disabled = () =>
                props.disabled ||
                field.disabled() ||
                (picker?.disabled() ?? false);
            const state = computed<ColorFieldState>(() => ({
                value: value.value,
                inputValue: typed.value ?? valueText.value,
                disabled: disabled(),
                readOnly: props.readOnly,
                required: props.required,
            }));

            const setValue = (next: Color | null, details: ChangeDetails) => {
                if (!isSameColor(next, value.value)) {
                    own.set(next, details);
                }
            };
            /** The channel's number in `text` (channel mode), or `null`. */
            const channelOf = (text: string): number | null => {
                const edited = props.channel;
                if (edited === undefined) {
                    return null;
                }
                const { format, scale } = colorChannelFormat(edited);
                const parsed = parseNumber(text, {
                    locale: props.locale,
                    format,
                });
                return parsed === null || Number.isNaN(parsed)
                    ? null
                    : round2(clampColorChannel(edited, parsed / scale));
            };
            const withChannel = (number: number): Color => {
                const edited = props.channel as ColorChannel;
                return setColorChannel(
                    value.value ?? black(space.value),
                    edited,
                    clampColorChannel(edited, round2(number)),
                );
            };
            const commitText = (
                reason: "keyboard" | "input-blur",
                event: Event,
            ) => {
                const text = typed.value;
                if (text === null) {
                    return;
                }
                typed.value = null;
                if (props.channel === undefined) {
                    if (text.trim() === "") {
                        setValue(null, { reason: "input-clear", event });
                        return;
                    }
                    const parsed = parseColor(text);
                    if (parsed !== null) {
                        setValue(parsed, { reason, event });
                    }
                    return;
                }
                const number = channelOf(text);
                if (number !== null) {
                    setValue(withChannel(number), { reason, event });
                }
            };
            const stepKey = (key: string, shiftKey: boolean, event: Event) => {
                if (disabled() || props.readOnly) {
                    return false;
                }
                const reason: ChangeReason = "keyboard";
                const edited = props.channel;
                if (edited === undefined) {
                    if (key !== "ArrowUp" && key !== "ArrowDown") {
                        return false;
                    }
                    const base =
                        typed.value === null
                            ? value.value
                            : (parseColor(typed.value) ?? value.value);
                    typed.value = null;
                    setValue(stepHex(base, key === "ArrowUp" ? 1 : -1), {
                        reason,
                        event,
                    });
                    return true;
                }
                const range = colorChannelRange(edited);
                const typedNumber =
                    typed.value === null ? null : channelOf(typed.value);
                const base =
                    typedNumber ??
                    (value.value === null
                        ? range.min
                        : getColorChannel(value.value, edited));
                const amount = shiftKey ? range.largeStep : range.step;
                let next: number;
                switch (key) {
                    case "ArrowUp":
                        next = base + amount;
                        break;
                    case "ArrowDown":
                        next = base - amount;
                        break;
                    case "PageUp":
                        next = base + range.largeStep;
                        break;
                    case "PageDown":
                        next = base - range.largeStep;
                        break;
                    case "Home":
                        next = range.min;
                        break;
                    case "End":
                        next = range.max;
                        break;
                    default:
                        return false;
                }
                typed.value = null;
                setValue(withChannel(next), { reason, event });
                return true;
            };

            // a form reset returns it to its default, and its text with it
            watch(
                hidden,
                (element, _, onCleanup) => {
                    if (element === null) {
                        return;
                    }
                    onCleanup(
                        bridgeForm(element, {
                            reset: () => {
                                typed.value = null;
                                // a bound field is reset by its picker
                                if (bound() === null) {
                                    field.reset();
                                    const next =
                                        toColor(defaultValue()) ?? null;
                                    if (!isSameColor(next, value.value)) {
                                        own.set(next, { reason: "none" });
                                    }
                                }
                                // the rendered texts: Vue sets `value` as a property only, so
                                // the browser's reset emptied them, and an unchanged value
                                // patches nothing
                                element.value = formValue.value;
                                const text = input.value;
                                if (text instanceof HTMLInputElement) {
                                    text.value = valueText.value;
                                }
                            },
                            invalid: () => input.value,
                        }),
                    );
                },
                { flush: "post" },
            );

            const attributes = () => ({
                ...stateAttributes({
                    disabled: disabled(),
                    readonly: props.readOnly,
                    required: props.required,
                    channel: props.channel,
                }),
                ...field.attributes(),
            });
            provide(ColorFieldKey, {
                state,
                channel: () => props.channel,
                channelValue,
                range: () =>
                    props.channel === undefined
                        ? undefined
                        : colorChannelRange(props.channel),
                valueText,
                inputId,
                field,
                attributes,
                onInputText: (text: string) => {
                    typed.value = text;
                },
                commitText,
                stepKey,
                setInputElement: elementSetter(input),
            });

            return () => {
                const current = state.value;
                return h(Fragment, [
                    renderPart("div", { attrs, slots }, props.as, current, {
                        "data-primitives-part": "color-field-root",
                        ...attributes(),
                    }),
                    h("input", {
                        ref: (element: unknown) => {
                            hidden.value = element as HTMLInputElement | null;
                        },
                        type: "text",
                        "aria-hidden": "true",
                        tabindex: -1,
                        name:
                            bound() === null
                                ? (field.name() ?? props.name)
                                : undefined,
                        value: formValue.value,
                        required: current.required,
                        disabled: current.disabled,
                        onFocus: () => input.value?.focus(),
                        style: VISUALLY_HIDDEN_INPUT_STYLE,
                        "data-primitives-part": "color-field-hidden-input",
                    }),
                ]);
            };
        },
    }),
);
