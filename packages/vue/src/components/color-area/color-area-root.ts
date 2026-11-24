import {
    type Color,
    type ColorChannel,
    type ColorSpace,
    colorAreaBackground,
    colorAreaChannels,
    colorChannelRange,
    convertColor,
    getColorChannel,
    isSameColor,
    parseColor,
    setColorChannel,
} from "@fragiola/primitives/color";
import { getDirection } from "@fragiola/primitives/direction";
import { bridgeForm } from "@fragiola/primitives/form";
import { startDrag } from "@fragiola/primitives/pointer";
import {
    fractionAlong,
    snapToStep,
    valueAtFraction,
} from "@fragiola/primitives/range";
import {
    computed,
    defineComponent,
    onBeforeUnmount,
    type PropType,
    provide,
    ref,
    shallowRef,
    watch,
} from "vue";
import { useColorPickerBinding } from "../../composables/use-color-picker-binding.ts";
import { useControllable } from "../../composables/use-controllable.ts";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useProvidedDirection } from "../../direction/direction-context.ts";
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
    type ColorAreaAxis,
    type ColorAreaContext,
    ColorAreaKey,
    type ColorAreaState,
    colorAreaState,
} from "./color-area-context.ts";

const WHITE_HUE: Color = {
    space: "hsb",
    hue: 0,
    saturation: 100,
    brightness: 100,
    alpha: 1,
};

/** A `Color`, or a string `parseColor` reads (the default when it reads none). */
function toColor(value: Color | string): Color {
    return parseColor(value) ?? WHITE_HUE;
}

export interface ColorAreaRootProps {
    value?: Color | string;
    defaultValue?: Color | string;
    xChannel?: ColorChannel;
    yChannel?: ColorChannel;
    colorSpace?: ColorSpace;
    disabled?: boolean;
    /** The locale of the channels' text (BCP 47; default: the runtime's). */
    locale?: string;
}

export type ColorAreaRootEmits = {
    "update:value": (value: Color) => true;
    valueChange: (value: Color, details: ChangeDetails) => true;
    /** When a drag ends, or after a key changed the value. */
    valueCommit: (value: Color, details: ChangeDetails) => true;
};

/**
 * Holds a color area's value (`v-model:value`): the `group` the consumer names, the interactive
 * area and its background (spec/color-area.md: two APG sliders, one native range input per axis).
 */
export const ColorAreaRoot: PartComponent<
    ColorAreaRootProps,
    ColorAreaState,
    ColorAreaRootEmits
> = publicComponent(
    defineComponent({
        name: "ColorAreaRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: {
                type: [Object, String] as PropType<Color | string>,
                default: undefined,
            },
            defaultValue: {
                type: [Object, String] as PropType<Color | string>,
                default: undefined,
            },
            xChannel: {
                type: String as PropType<ColorChannel>,
                default: undefined,
            },
            yChannel: {
                type: String as PropType<ColorChannel>,
                default: undefined,
            },
            colorSpace: {
                type: String as PropType<ColorSpace>,
                default: undefined,
            },
            disabled: { type: Boolean, default: false },
            /** The locale of the channels' text (BCP 47; default: the runtime's). */
            locale: { type: String, default: undefined },
        },
        emits: {
            "update:value": (_value: Color) => true,
            valueChange: (_value: Color, _details: ChangeDetails) => true,
            /** When a drag ends, or after a key changed the value. */
            valueCommit: (_value: Color, _details: ChangeDetails) => true,
        },
        setup(props, { attrs, slots, emit }) {
            const direction = useProvidedDirection();
            const report = (next: Color, details: ChangeDetails) => {
                emit("update:value", next);
                emit("valueChange", next, details);
            };
            const defaultValue = () => props.defaultValue ?? WHITE_HUE;
            // inside a ColorPicker, bound to its color unless given its own (spec/color-picker.md)
            const state = useColorPickerBinding(
                () =>
                    props.value !== undefined ||
                    props.defaultValue !== undefined,
                useControllable<Color, ChangeDetails>(
                    () =>
                        props.value === undefined
                            ? undefined
                            : toColor(props.value),
                    toColor(defaultValue()),
                    report,
                ),
                report,
            );
            const { picker, bound } = state;
            const disabled = () =>
                props.disabled || (picker?.disabled() ?? false);
            const channels = computed(() =>
                colorAreaChannels(state.value.value, {
                    xChannel: props.xChannel,
                    yChannel: props.yChannel,
                    colorSpace: props.colorSpace,
                }),
            );
            const color = computed(() =>
                convertColor(state.value.value, channels.value.space),
            );
            const xValue = computed(() =>
                getColorChannel(color.value, channels.value.xChannel),
            );
            const yValue = computed(() =>
                getColorChannel(color.value, channels.value.yChannel),
            );
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            const dragging = ref(false);
            const activeAxis = ref<ColorAreaAxis>("x");
            const inputs = shallowRef<
                Readonly<Record<ColorAreaAxis, HTMLInputElement | null>>
            >({ x: null, y: null });
            let endDrag: (() => void) | null = null;
            onBeforeUnmount(() => endDrag?.());

            const context: ColorAreaContext = {
                color,
                space: () => channels.value.space,
                xChannel: () => channels.value.xChannel,
                yChannel: () => channels.value.yChannel,
                xValue,
                yValue,
                xRange: () => colorChannelRange(channels.value.xChannel),
                yRange: () => colorChannelRange(channels.value.yChannel),
                disabled,
                dragging,
                locale: () => props.locale,
                activeAxis,
                setValues(
                    values: { x?: number; y?: number },
                    reason: ChangeReason,
                ) {
                    const before = color.value;
                    const { xChannel: x, yChannel: y } = channels.value;
                    let next = before;
                    if (values.x !== undefined) {
                        next = setColorChannel(
                            next,
                            x,
                            snapToStep(values.x, colorChannelRange(x)),
                        );
                    }
                    if (values.y !== undefined) {
                        next = setColorChannel(
                            next,
                            y,
                            snapToStep(values.y, colorChannelRange(y)),
                        );
                    }
                    if (isSameColor(next, before)) {
                        return before;
                    }
                    state.set(next, { reason });
                    return next;
                },
                commit(committed?: Color) {
                    const done = committed ?? color.value;
                    emit("valueCommit", done, { reason: "none" });
                    bound()?.commit(done, { reason: "none" });
                },
                inputs,
                registerInput(
                    axis: ColorAreaAxis,
                    input: HTMLInputElement | null,
                ) {
                    if (inputs.value[axis] !== input) {
                        inputs.value = { ...inputs.value, [axis]: input };
                    }
                },
            };
            provide(ColorAreaKey, context);

            // a form reset returns the area to its default (spec/color-area.md, "Forms")
            watch(
                () => inputs.value.x ?? inputs.value.y,
                (first, _, onCleanup) => {
                    if (first === null) {
                        return;
                    }
                    onCleanup(
                        bridgeForm(first, {
                            reset: () => {
                                // a bound control is reset by its picker; its inputs still
                                // show the color again
                                const next = toColor(defaultValue());
                                if (
                                    bound() === null &&
                                    !isSameColor(next, state.value.value)
                                ) {
                                    state.set(next, { reason: "none" });
                                }
                                // the rendered values: Vue sets `value` as a property only, so
                                // the browser's reset moved the range inputs, and an unchanged
                                // value patches nothing
                                for (const axis of ["x", "y"] as const) {
                                    const input = inputs.value[axis];
                                    if (input !== null) {
                                        input.value = String(
                                            axis === "x"
                                                ? xValue.value
                                                : yValue.value,
                                        );
                                    }
                                }
                            },
                        }),
                    );
                },
                { flush: "post" },
            );

            const valuesAt = (target: HTMLElement, x: number, y: number) => {
                const box = target.getBoundingClientRect();
                const point = { x, y };
                return {
                    x: valueAtFraction(
                        fractionAlong(
                            box,
                            point,
                            "horizontal",
                            getDirection(target, direction()) === "rtl",
                        ),
                        context.xRange(),
                    ),
                    y: valueAtFraction(
                        fractionAlong(box, point, "vertical", false),
                        context.yRange(),
                    ),
                };
            };

            const onPointerdown = (event: PointerEvent) => {
                if (
                    disabled() ||
                    (event.pointerType === "mouse" && event.button !== 0)
                ) {
                    return;
                }
                event.preventDefault();
                const target = event.currentTarget as HTMLElement;
                context.setValues(
                    valuesAt(target, event.clientX, event.clientY),
                    "track-press",
                );
                const list = inputs.value;
                (list[activeAxis.value] ?? list.x)?.focus();
                dragging.value = true;
                endDrag?.();
                endDrag = startDrag(target, event, {
                    onMove: (move) =>
                        context.setValues(
                            valuesAt(target, move.clientX, move.clientY),
                            "drag",
                        ),
                    onEnd: () => {
                        endDrag = null;
                        dragging.value = false;
                        context.commit();
                    },
                });
            };

            return () => {
                const current = colorAreaState(context);
                const provided = direction();
                const rtl =
                    provided !== null
                        ? provided === "rtl"
                        : element.value !== null &&
                          getDirection(element.value) === "rtl";
                const background = colorAreaBackground(
                    current.color,
                    current.xChannel,
                    current.yChannel,
                    rtl,
                );
                return renderPart("div", { attrs, slots }, props.as, current, {
                    role: "group",
                    "data-primitives-part": "color-area-root",
                    ...stateAttributes({
                        disabled: current.disabled,
                        dragging: current.dragging,
                    }),
                    // structural: the thumb's box, no page scroll under a touch drag, the
                    // background a recipe draws
                    style: {
                        position: "relative",
                        touchAction: "none",
                        "--color-area-background": background.backgroundImage,
                        "--color-area-background-blend-mode":
                            background.backgroundBlendMode,
                    },
                    onPointerdown,
                    ref: setElement,
                });
            };
        },
    }),
);
