import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ColorSliderContext,
    type ColorSliderState,
    colorSliderAttributes,
    colorSliderState,
} from "./color-slider-context.ts";

export type ColorSliderOutputProps = PartProps<ColorSliderState>;

/**
 * Shows the channel's value as text (`Intl`: `"120°"`, `"50%"`), an `output` for the Thumb;
 * children of its own replace it (spec/color-slider.md).
 */
export function ColorSliderOutput({
    children,
    ...props
}: ColorSliderOutputProps) {
    const context = useRequiredContext(
        ColorSliderContext,
        "ColorSlider.Output",
    );
    const id = context.thumb?.id;
    return renderElement(
        "output",
        { ...props, children: children ?? context.valueText },
        colorSliderState(context),
        {
            htmlFor: id === undefined || id === "" ? undefined : id,
            "aria-live": "off",
            "data-primitives-part": "color-slider-output",
            ...stateAttributes(colorSliderAttributes(context)),
        },
    );
}
