import {
    type Color,
    colorSpaceFor,
    convertColor,
    formatColor,
    formatColorChannel,
    getColorChannel,
    hueAtPoint,
    isOnColorWheel,
    isSameColor,
    parseColor,
    setColorChannel,
    wrapHue,
} from "@fragiola/primitives/color";
import { bridgeForm } from "@fragiola/primitives/form";
import { startDrag } from "@fragiola/primitives/pointer";
import {
    computed,
    defineComponent,
    h,
    onBeforeUnmount,
    type PropType,
    provide,
    ref,
    shallowRef,
    watch,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
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
    type ColorWheelContext,
    ColorWheelKey,
    type ColorWheelState,
    colorWheelState,
} from "./color-wheel-context.ts";

const RED: Color = {
    space: "hsl",
    hue: 0,
    saturation: 100,
    lightness: 50,
    alpha: 1,
};

/** A `Color`, or a string `parseColor` reads (the default when it reads none). */
function toColor(value: Color | string): Color {
    return parseColor(value) ?? RED;
}

export interface ColorWheelRootProps {
    value?: Color | string;
    defaultValue?: Color | string;
    /** The space of the hue (default: the value's, else hsb). */
    colorSpace?: "hsl" | "hsb";
    /** The ring's outer radius, in px (default 100). */
    outerRadius?: number;
    /** The ring's inner radius, in px (default 75). */
    innerRadius?: number;
    disabled?: boolean;
    name?: string;
    /** The locale of the hue's text (BCP 47; default: the runtime's). */
    locale?: string;
}

export type ColorWheelRootEmits = {
    "update:value": (value: Color) => true;
    valueChange: (value: Color, details: ChangeDetails) => true;
    /** When a drag ends, or after a key changed the value. */
    valueCommit: (value: Color, details: ChangeDetails) => true;
};

/**
 * Holds a color wheel's value (`v-model:value`): the interactive square around the ring, and the
 * hidden input with the color as hex (spec/color-wheel.md, the APG slider on a ring).
 */
export const ColorWheelRoot: PartComponent<
    ColorWheelRootProps,
    ColorWheelState,
    ColorWheelRootEmits
> = publicComponent(
    defineComponent({
        name: "ColorWheelRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: {
                type: [Object, String] as PropType<Color | string>,
                default: undefined,
            },
            defaultValue: {
                type: [Object, String] as PropType<Color | string>,
                default: () => RED,
            },
            /** The space of the hue (default: the value's, else hsb). */
            colorSpace: {
                type: String as PropType<"hsl" | "hsb">,
                default: undefined,
            },
            /** The ring's outer radius, in px (default 100). */
            outerRadius: { type: Number, default: 100 },
            /** The ring's inner radius, in px (default 75). */
            innerRadius: { type: Number, default: 75 },
            disabled: { type: Boolean, default: false },
            name: { type: String, default: undefined },
            /** The locale of the hue's text (BCP 47; default: the runtime's). */
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
            const color = computed(() =>
                convertColor(
                    state.value.value,
                    colorSpaceFor("hue", state.value.value, props.colorSpace),
                ),
            );
            const hue = computed(() => getColorChannel(color.value, "hue"));
            const valueText = computed(() =>
                formatColorChannel(color.value, "hue", props.locale, hue.value),
            );
            const input = shallowRef<HTMLInputElement | null>(null);
            const thumb = shallowRef<HTMLElement | null>(null);
            const dragging = ref(false);
            let endDrag: (() => void) | null = null;
            onBeforeUnmount(() => endDrag?.());

            const context: ColorWheelContext = {
                color,
                hue,
                outerRadius: () => props.outerRadius,
                innerRadius: () => props.innerRadius,
                disabled: () => props.disabled,
                dragging,
                valueText,
                setHue(next: number, reason: ChangeReason) {
                    const before = color.value;
                    const wrapped = wrapHue(next);
                    if (wrapped === getColorChannel(before, "hue")) {
                        return before;
                    }
                    const changed = setColorChannel(before, "hue", wrapped);
                    state.set(changed, { reason });
                    return changed;
                },
                commit(committed?: Color) {
                    emit("valueCommit", committed ?? color.value, {
                        reason: "none",
                    });
                },
                thumb,
            };
            provide(ColorWheelKey, context);

            // a form reset returns the wheel to its default (spec/color-wheel.md, "Forms")
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
                                if (!isSameColor(next, state.value.value)) {
                                    state.set(next, { reason: "none" });
                                }
                            },
                        }),
                    );
                },
                { flush: "post" },
            );

            const onPointerdown = (event: PointerEvent) => {
                if (
                    props.disabled ||
                    (event.pointerType === "mouse" && event.button !== 0)
                ) {
                    return;
                }
                const target = event.currentTarget as HTMLElement;
                const point = { x: event.clientX, y: event.clientY };
                const box = target.getBoundingClientRect();
                // a press off the ring does nothing (spec/color-wheel.md, "Pointer")
                if (
                    !isOnColorWheel(
                        box,
                        point,
                        props.innerRadius,
                        props.outerRadius,
                    )
                ) {
                    return;
                }
                event.preventDefault();
                context.setHue(hueAtPoint(box, point), "track-press");
                thumb.value?.focus();
                dragging.value = true;
                endDrag?.();
                endDrag = startDrag(target, event, {
                    onMove: (move) =>
                        context.setHue(
                            hueAtPoint(target.getBoundingClientRect(), {
                                x: move.clientX,
                                y: move.clientY,
                            }),
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
                const current = colorWheelState(context);
                const size = `${props.outerRadius * 2}px`;
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    current,
                    {
                        "data-primitives-part": "color-wheel-root",
                        ...stateAttributes({
                            disabled: current.disabled,
                            dragging: current.dragging,
                        }),
                        // structural: the square around the ring, no page scroll under a touch
                        // drag, the radii a recipe's ring mask reads
                        style: {
                            position: "relative",
                            inlineSize: size,
                            blockSize: size,
                            touchAction: "none",
                            "--color-wheel-outer-radius": `${props.outerRadius}px`,
                            "--color-wheel-inner-radius": `${props.innerRadius}px`,
                        },
                        onPointerdown,
                    },
                    () => [
                        slots.default?.({ state: current }),
                        h("input", {
                            ref: (element: unknown) => {
                                input.value =
                                    element as HTMLInputElement | null;
                            },
                            type: "hidden",
                            name: props.name,
                            value: formatColor(current.color, "hex"),
                            "data-primitives-part": "color-wheel-input",
                        }),
                    ],
                );
            };
        },
    }),
);
