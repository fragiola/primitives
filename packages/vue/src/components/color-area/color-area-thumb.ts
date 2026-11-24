import { formatColor, setColorChannel } from "@fragiola/primitives/color";
import { getDirection } from "@fragiola/primitives/direction";
import { valueToPercent } from "@fragiola/primitives/range";
import { defineComponent, shallowRef } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ColorAreaKey,
    type ColorAreaState,
    colorAreaState,
} from "./color-area-context.ts";

/** Marks the area's point and holds its Inputs (spec/color-area.md). */
export const ColorAreaThumb: PartComponent<
    Record<never, never>,
    ColorAreaState
> = publicComponent(
    defineComponent({
        name: "ColorAreaThumb",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(ColorAreaKey, "ColorArea.Thumb");
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            return () => {
                const state = colorAreaState(context);
                // the centring translate is physical: the layout's (computed) direction
                // (Slider's Thumb)
                const layoutRtl =
                    element.value !== null &&
                    getDirection(element.value) === "rtl";
                const xRange = context.xRange();
                const yRange = context.yRange();
                const x = valueToPercent(
                    context.xValue.value,
                    xRange.min,
                    xRange.max,
                );
                const y = valueToPercent(
                    context.yValue.value,
                    yRange.min,
                    yRange.max,
                );
                return renderPart("div", { attrs, slots }, props.as, state, {
                    "data-primitives-part": "color-area-thumb",
                    ...stateAttributes({
                        disabled: state.disabled,
                        dragging: state.dragging,
                    }),
                    // structural: its centre on the point, and its color for the recipe
                    style: {
                        position: "absolute",
                        insetInlineStart: `${x}%`,
                        insetBlockEnd: `${y}%`,
                        translate: layoutRtl ? "50% 50%" : "-50% 50%",
                        "--color-area-thumb-color": formatColor(
                            setColorChannel(state.color, "alpha", 1),
                        ),
                    },
                    ref: setElement,
                });
            };
        },
    }),
);
