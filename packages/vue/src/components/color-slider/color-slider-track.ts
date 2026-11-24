import { colorChannelGradient } from "@fragiola/primitives/color";
import { getDirection } from "@fragiola/primitives/direction";
import { startDrag } from "@fragiola/primitives/pointer";
import { fractionAlong, valueAtFraction } from "@fragiola/primitives/range";
import { defineComponent, onBeforeUnmount, shallowRef } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import { useProvidedDirection } from "../../direction/direction-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ColorSliderKey,
    type ColorSliderState,
    colorSliderAttributes,
    colorSliderState,
} from "./color-slider-context.ts";

/**
 * The interactive area and the channel's gradient: a press moves the thumb there, then drags it
 * with pointer capture (spec/color-slider.md, "Pointer").
 */
export const ColorSliderTrack: PartComponent<
    Record<never, never>,
    ColorSliderState
> = publicComponent(
    defineComponent({
        name: "ColorSliderTrack",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                ColorSliderKey,
                "ColorSlider.Track",
            );
            const direction = useProvidedDirection();
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            let endDrag: (() => void) | null = null;
            onBeforeUnmount(() => endDrag?.());

            const valueAt = (target: HTMLElement, x: number, y: number) => {
                const fraction = fractionAlong(
                    target.getBoundingClientRect(),
                    { x, y },
                    context.orientation(),
                    getDirection(target, direction()) === "rtl",
                );
                return valueAtFraction(fraction, context.range.value);
            };

            const onPointerdown = (event: PointerEvent) => {
                if (
                    context.disabled() ||
                    (event.pointerType === "mouse" && event.button !== 0)
                ) {
                    return;
                }
                event.preventDefault();
                const target = event.currentTarget as HTMLElement;
                context.setChannelValue(
                    valueAt(target, event.clientX, event.clientY),
                    "track-press",
                );
                context.thumb.value?.focus();
                context.dragging.value = true;
                endDrag?.();
                endDrag = startDrag(target, event, {
                    onMove: (move) =>
                        context.setChannelValue(
                            valueAt(target, move.clientX, move.clientY),
                            "drag",
                        ),
                    onEnd: () => {
                        endDrag = null;
                        context.dragging.value = false;
                        context.commit();
                    },
                });
            };

            return () => {
                const provided = direction();
                const rtl =
                    provided !== null
                        ? provided === "rtl"
                        : element.value !== null &&
                          getDirection(element.value) === "rtl";
                const gradient = colorChannelGradient(
                    context.color.value,
                    context.channel(),
                    context.orientation() === "vertical"
                        ? "to top"
                        : rtl
                          ? "to left"
                          : "to right",
                );
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    colorSliderState(context),
                    {
                        "data-primitives-part": "color-slider-track",
                        ...stateAttributes(
                            colorSliderAttributes(context, true),
                        ),
                        // structural: the thumb's box, no page scroll under a touch drag, the
                        // gradient a recipe draws
                        style: {
                            position: "relative",
                            touchAction: "none",
                            "--color-slider-track-background": gradient,
                        },
                        onPointerdown,
                        ref: setElement,
                    },
                );
            };
        },
    }),
);
