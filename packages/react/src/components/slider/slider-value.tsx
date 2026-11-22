import type { ReactNode } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    SliderContext,
    type SliderState,
    sliderState,
} from "./slider-context.ts";

export interface SliderValueProps
    extends Omit<PartProps<SliderState>, "children"> {
    /** Its content: a node, or a function of the formatted values and the values. */
    children?:
        | ReactNode
        | ((
              formattedValues: readonly string[],
              values: readonly number[],
          ) => ReactNode);
}

/**
 * Shows the slider's value(s): an `output` for its thumbs, the formatted values joined with
 * `" – "` by default (spec/slider.md).
 */
export function SliderValue({ children, ...props }: SliderValueProps) {
    const context = useRequiredContext(SliderContext, "Slider.Value");
    const { values } = context;
    const formattedValues = values.map(context.formatValue);
    const content =
        typeof children === "function"
            ? children(formattedValues, values)
            : (children ?? formattedValues.join(" – "));
    // the thumbs' ids in value order
    const ids = [...context.thumbs]
        .sort(
            (a, b) =>
                Number(a.dataset.index ?? 0) - Number(b.dataset.index ?? 0),
        )
        .map((thumb) => thumb.id)
        .filter((id) => id !== "");
    return renderElement(
        "output",
        { ...props, children: content },
        sliderState(context),
        {
            htmlFor: ids.length > 0 ? ids.join(" ") : undefined,
            "aria-live": "off",
            "data-primitives-part": "slider-value",
            ...stateAttributes({
                orientation: context.orientation,
                disabled: context.disabled,
            }),
        },
    );
}
