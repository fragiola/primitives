import {
    type Color,
    type ColorChannel,
    type ColorSpace,
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
import { bridgeForm } from "@fragiola/primitives/form";
import { snapToStep } from "@fragiola/primitives/range";
import {
    computed,
    defineComponent,
    h,
    type PropType,
    provide,
    ref,
    shallowRef,
    watch,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import { useFieldControl } from "../../composables/use-field-control.ts";
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
import {
    type ColorSliderContext,
    ColorSliderKey,
    type ColorSliderState,
    colorSliderAttributes,
    colorSliderState,
} from "./color-slider-context.ts";

const BLACK: Color = { space: "rgb", red: 0, green: 0, blue: 0, alpha: 1 };

/** A `Color`, or a string `parseColor` reads (black when it reads none). */
function toColor(value: Color | string): Color {
    return parseColor(value) ?? BLACK;
}

export interface ColorSliderRootProps {
    value?: Color | string;
    defaultValue?: Color | string;
    /** The channel the slider edits. */
    channel: ColorChannel;
    /** The space it edits the channel in (default: the value's, else the channel's own). */
    colorSpace?: ColorSpace;
    orientation?: "horizontal" | "vertical";
    disabled?: boolean;
    name?: string;
    /** The locale of the channel's text (BCP 47; default: the runtime's). */
    locale?: string;
}

export type ColorSliderRootEmits = {
    "update:value": (value: Color) => true;
    valueChange: (value: Color, details: ChangeDetails) => true;
    /** When a drag ends, or after a key changed the value. */
    valueCommit: (value: Color, details: ChangeDetails) => true;
};

/**
 * Holds a color slider's value (`v-model:value`); renders the `group` and the hidden input with
 * the color as hex (spec/color-slider.md, the APG slider).
 */
export const ColorSliderRoot: PartComponent<
    ColorSliderRootProps,
    ColorSliderState,
    ColorSliderRootEmits
> = publicComponent(
    defineComponent({
        name: "ColorSliderRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: {
                type: [Object, String] as PropType<Color | string>,
                default: undefined,
            },
            defaultValue: {
                type: [Object, String] as PropType<Color | string>,
                default: "#000000",
            },
            /** The channel the slider edits. */
            channel: {
                type: String as PropType<ColorChannel>,
                required: true,
            },
            /** The space it edits the channel in (default: the value's, else the channel's own). */
            colorSpace: {
                type: String as PropType<ColorSpace>,
                default: undefined,
            },
            orientation: {
                type: String as PropType<"horizontal" | "vertical">,
                default: "horizontal",
            },
            disabled: { type: Boolean, default: false },
            name: { type: String, default: undefined },
            /** The locale of the channel's text (BCP 47; default: the runtime's). */
            locale: { type: String, default: undefined },
        },
        emits: {
            "update:value": (_value: Color) => true,
            valueChange: (_value: Color, _details: ChangeDetails) => true,
            /** When a drag ends, or after a key changed the value. */
            valueCommit: (_value: Color, _details: ChangeDetails) => true,
        },
        setup(props, { attrs, slots, emit }) {
            const state = useControllable<Color, ChangeDetails>(
                () =>
                    props.value === undefined
                        ? undefined
                        : toColor(props.value),
                toColor(props.defaultValue),
                (next, details) => {
                    emit("update:value", next);
                    emit("valueChange", next, details);
                },
            );
            const space = computed(() =>
                colorSpaceFor(
                    props.channel,
                    state.value.value,
                    props.colorSpace,
                ),
            );
            const color = computed(() =>
                convertColor(state.value.value, space.value),
            );
            const value = computed(() =>
                getColorChannel(color.value, props.channel),
            );
            const range = computed(() => colorChannelRange(props.channel));
            const hex = computed(() => formatColor(color.value, "hex"));
            const valueText = computed(() =>
                formatColorChannel(
                    color.value,
                    props.channel,
                    props.locale,
                    value.value,
                ),
            );
            const input = shallowRef<HTMLInputElement | null>(null);
            const thumb = shallowRef<HTMLElement | null>(null);
            const dragging = ref(false);
            const labelId = ref<string>();
            const field = useFieldControl({
                id: () => undefined,
                labelable: false,
                value: () => hex.value,
                // a slider always has a value
                filled: () => true,
                input: () => input.value,
                focusTarget: () => thumb.value,
            });

            const context: ColorSliderContext = {
                field,
                color,
                channel: () => props.channel,
                space,
                value,
                range,
                orientation: () => props.orientation,
                disabled: () => props.disabled || field.disabled(),
                dragging,
                valueText,
                setChannelValue(next: number, reason: ChangeReason) {
                    const before = color.value;
                    const snapped = snapToStep(
                        next,
                        colorChannelRange(props.channel),
                    );
                    if (snapped === getColorChannel(before, props.channel)) {
                        return before;
                    }
                    const changed = setColorChannel(
                        before,
                        props.channel,
                        snapped,
                    );
                    state.set(changed, { reason });
                    return changed;
                },
                commit(committed?: Color) {
                    emit("valueCommit", committed ?? color.value, {
                        reason: "none",
                    });
                },
                thumb,
                labelId,
            };
            provide(ColorSliderKey, context);

            // a form reset returns the slider to its default (spec/README.md, "Forms")
            watch(
                input,
                (element, _, onCleanup) => {
                    if (element === null) {
                        return;
                    }
                    onCleanup(
                        bridgeForm(element, {
                            reset: () => {
                                const next = toColor(props.defaultValue);
                                // no change reported when it already is at its default
                                if (!isSameColor(next, state.value.value)) {
                                    field.reset();
                                    state.set(next, { reason: "none" });
                                }
                            },
                        }),
                    );
                },
                { flush: "post" },
            );

            return () => {
                const current = colorSliderState(context);
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    current,
                    {
                        role: "group",
                        // the Field's label, else the slider's own Label
                        "aria-labelledby":
                            field.aria()["aria-labelledby"] ?? labelId.value,
                        "data-primitives-part": "color-slider-root",
                        ...field.attributes(),
                        ...stateAttributes(
                            colorSliderAttributes(context, true),
                        ),
                    },
                    () => [
                        slots.default?.({ state: current }),
                        h("input", {
                            ref: (element: unknown) => {
                                input.value =
                                    element as HTMLInputElement | null;
                            },
                            type: "hidden",
                            name: field.name() ?? props.name,
                            value: hex.value,
                            "data-primitives-part": "color-slider-input",
                        }),
                    ],
                );
            };
        },
    }),
);
