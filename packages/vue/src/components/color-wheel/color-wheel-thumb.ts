import {
    colorWheelKeyTarget,
    colorWheelThumbOffset,
    formatColor,
    setColorChannel,
} from "@fragiola/primitives/color";
import { defineComponent, onBeforeUnmount, shallowRef, watch } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ColorWheelKey,
    type ColorWheelState,
    colorWheelState,
} from "./color-wheel-context.ts";

/** The `slider`: the hue, on the ring's middle circle (spec/color-wheel.md). */
export const ColorWheelThumb: PartComponent<
    Record<never, never>,
    ColorWheelState
> = publicComponent(
    defineComponent({
        name: "ColorWheelThumb",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                ColorWheelKey,
                "ColorWheel.Thumb",
            );
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            watch(
                element,
                (node) => {
                    context.thumb.value = node;
                },
                { flush: "post" },
            );
            onBeforeUnmount(() => {
                if (context.thumb.value === element.value) {
                    context.thumb.value = null;
                }
            });

            const onKeydown = (event: KeyboardEvent) => {
                if (context.disabled()) {
                    return;
                }
                const target = colorWheelKeyTarget(
                    event.key,
                    event.shiftKey,
                    context.hue.value,
                );
                if (target === null) {
                    return;
                }
                event.preventDefault();
                context.commit(context.setHue(target, "keyboard"));
            };

            return () => {
                const state = colorWheelState(context);
                const { hue, disabled } = state;
                const offset = colorWheelThumbOffset(
                    hue,
                    (context.innerRadius() + context.outerRadius()) / 2,
                );
                return renderPart("div", { attrs, slots }, props.as, state, {
                    role: "slider",
                    tabindex: disabled ? undefined : 0,
                    "aria-valuenow": hue,
                    "aria-valuemin": 0,
                    "aria-valuemax": 360,
                    "aria-valuetext": context.valueText.value,
                    "aria-disabled": disabled ? "true" : undefined,
                    "data-primitives-part": "color-wheel-thumb",
                    ...stateAttributes({
                        disabled,
                        dragging: state.dragging,
                    }),
                    // structural: its centre on the hue's point of the ring, and its color for
                    // the recipe
                    style: {
                        position: "absolute",
                        left: `calc(50% + ${offset.x}px)`,
                        top: `calc(50% + ${offset.y}px)`,
                        translate: "-50% -50%",
                        "--color-wheel-thumb-color": formatColor(
                            setColorChannel(state.color, "alpha", 1),
                        ),
                    },
                    onKeydown,
                    ref: setElement,
                });
            };
        },
    }),
);
