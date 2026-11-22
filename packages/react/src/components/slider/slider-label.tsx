import { useId, useLayoutEffect } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    SliderContext,
    type SliderState,
    sliderState,
} from "./slider-context.ts";

export interface SliderLabelProps extends PartProps<SliderState> {
    id?: string;
}

/**
 * Names the slider: the Root and every Thumb with no name of its own (`aria-labelledby`). A press
 * on it focuses the first thumb (spec/slider.md).
 */
export function SliderLabel({ id: idProp, ...props }: SliderLabelProps) {
    const context = useRequiredContext(SliderContext, "Slider.Label");
    const generated = useId();
    const id = idProp ?? generated;
    const { setLabelId } = context;
    useLayoutEffect(() => {
        setLabelId(id);
        return () => setLabelId(undefined);
    }, [id, setLabelId]);
    return renderElement("div", props, sliderState(context), {
        id,
        "data-primitives-part": "slider-label",
        ...stateAttributes({
            orientation: context.orientation,
            disabled: context.disabled,
        }),
        // a `div` has no native `for`: the press focuses the first thumb (Base UI)
        onClick: () => {
            if (!context.disabled) {
                context.thumbs[0]?.focus();
            }
        },
    });
}
