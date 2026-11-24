import { colorWheelGradient } from "@fragiola/primitives/color";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ColorWheelContext,
    type ColorWheelState,
    colorWheelState,
} from "./color-wheel-context.ts";

/** The ring: its conic gradient, for the recipe to draw (spec/color-wheel.md). */
export function ColorWheelTrack(props: PartProps<ColorWheelState>) {
    const context = useRequiredContext(ColorWheelContext, "ColorWheel.Track");
    return renderElement("div", props, colorWheelState(context), {
        "data-primitives-part": "color-wheel-track",
        ...stateAttributes({
            disabled: context.disabled,
            dragging: context.dragging,
        }),
        // structural: the Root's box, and the gradient a recipe draws
        style: {
            position: "absolute",
            inset: 0,
            "--color-wheel-track-background": colorWheelGradient(),
        },
    });
}
