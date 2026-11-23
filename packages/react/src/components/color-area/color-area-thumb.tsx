import { formatColor, setColorChannel } from "@fragiola/primitives/color";
import { getDirection } from "@fragiola/primitives/direction";
import { valueToPercent } from "@fragiola/primitives/range";
import { useElement } from "../../hooks/use-element.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ColorAreaContext,
    type ColorAreaState,
    colorAreaState,
} from "./color-area-context.ts";

/** Marks the area's point and holds its Inputs (spec/color-area.md). */
export function ColorAreaThumb(props: PartProps<ColorAreaState>) {
    const context = useRequiredContext(ColorAreaContext, "ColorArea.Thumb");
    const [element, ref] = useElement<HTMLElement>();
    // the centring translate is physical: the layout's (computed) direction (Slider's Thumb)
    const layoutRtl = element !== null && getDirection(element) === "rtl";
    const x = valueToPercent(
        context.xValue,
        context.xRange.min,
        context.xRange.max,
    );
    const y = valueToPercent(
        context.yValue,
        context.yRange.min,
        context.yRange.max,
    );
    return renderElement(
        "div",
        props,
        colorAreaState(context),
        {
            "data-primitives-part": "color-area-thumb",
            ...stateAttributes({
                disabled: context.disabled,
                dragging: context.dragging,
            }),
            // structural: its centre on the point, and its color for the recipe
            style: {
                position: "absolute",
                insetInlineStart: `${x}%`,
                insetBlockEnd: `${y}%`,
                translate: layoutRtl ? "50% 50%" : "-50% 50%",
                "--color-area-thumb-color": formatColor(
                    setColorChannel(context.color, "alpha", 1),
                ),
            },
        },
        ref,
    );
}
