import { useId, useLayoutEffect } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ColorSliderContext,
    type ColorSliderState,
    colorSliderAttributes,
    colorSliderState,
} from "./color-slider-context.ts";

export interface ColorSliderLabelProps extends PartProps<ColorSliderState> {
    id?: string;
}

/**
 * Names the slider: the Root and the Thumb while it has no name of its own. A press on it
 * focuses the Thumb (spec/color-slider.md, Slider's Label).
 */
export function ColorSliderLabel({
    id: idProp,
    ...props
}: ColorSliderLabelProps) {
    const context = useRequiredContext(ColorSliderContext, "ColorSlider.Label");
    const generated = useId();
    const id = idProp ?? generated;
    const { setLabelId } = context;
    useLayoutEffect(() => {
        setLabelId(id);
        return () => setLabelId(undefined);
    }, [id, setLabelId]);
    return renderElement("div", props, colorSliderState(context), {
        id,
        "data-primitives-part": "color-slider-label",
        ...stateAttributes(colorSliderAttributes(context)),
        // a `div` has no native `for`: the press focuses the thumb (Base UI's Slider)
        onClick: () => {
            if (!context.disabled) {
                context.thumb?.focus();
            }
        },
    });
}
