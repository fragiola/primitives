import { colorWheelGradient } from "@fragiola/primitives/color";
import { defineComponent } from "vue";
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

/** The ring: its conic gradient, for the recipe to draw (spec/color-wheel.md). */
export const ColorWheelTrack: PartComponent<
    Record<never, never>,
    ColorWheelState
> = publicComponent(
    defineComponent({
        name: "ColorWheelTrack",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                ColorWheelKey,
                "ColorWheel.Track",
            );
            return () => {
                const state = colorWheelState(context);
                return renderPart("div", { attrs, slots }, props.as, state, {
                    "data-primitives-part": "color-wheel-track",
                    ...stateAttributes({
                        disabled: state.disabled,
                        dragging: state.dragging,
                    }),
                    // structural: the Root's box, and the gradient a recipe draws
                    style: {
                        position: "absolute",
                        inset: 0,
                        "--color-wheel-track-background": colorWheelGradient(),
                    },
                });
            };
        },
    }),
);
