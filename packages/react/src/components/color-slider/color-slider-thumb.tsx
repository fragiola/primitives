import { formatColor, setColorChannel } from "@fragiola/primitives/color";
import { getDirection } from "@fragiola/primitives/direction";
import { sliderKeyTarget, valueToPercent } from "@fragiola/primitives/range";
import { type KeyboardEvent, useContext, useId, useLayoutEffect } from "react";
import { DirectionContext } from "../../direction/direction-context.ts";
import { useElement } from "../../hooks/use-element.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ColorSliderContext,
    type ColorSliderState,
    colorSliderAttributes,
    colorSliderState,
} from "./color-slider-context.ts";

export interface ColorSliderThumbProps extends PartProps<ColorSliderState> {
    /** Generated unless given (the Output's `for`). */
    id?: string;
}

/** The `slider`: the channel's value (spec/color-slider.md). */
export function ColorSliderThumb({
    id: idProp,
    ...props
}: ColorSliderThumbProps) {
    const context = useRequiredContext(ColorSliderContext, "ColorSlider.Thumb");
    const direction = useContext(DirectionContext);
    const generated = useId();
    const [element, ref] = useElement<HTMLElement>();
    const { setThumb } = context;
    useLayoutEffect(() => {
        setThumb(element);
        return () => setThumb(null);
    }, [element, setThumb]);

    const { value, range, disabled } = context;
    const vertical = context.orientation === "vertical";
    // a DirectionProvider's direction, else the computed one (spec/direction.md)
    const rtl =
        direction !== null
            ? direction === "rtl"
            : element !== null && getDirection(element) === "rtl";
    // the centring translate is physical: the layout's (computed) direction (Slider's Thumb)
    const layoutRtl = element !== null && getDirection(element) === "rtl";
    const percent = valueToPercent(value, range.min, range.max);
    const thumbColor = formatColor(
        context.channel === "alpha"
            ? context.color
            : setColorChannel(context.color, "alpha", 1),
    );
    // structural: the thumb's centre on its value, and its color for the recipe
    const style = vertical
        ? {
              position: "absolute" as const,
              insetBlockEnd: `${percent}%`,
              left: "50%",
              translate: "-50% 50%",
              "--color-slider-thumb-color": thumbColor,
          }
        : {
              position: "absolute" as const,
              insetInlineStart: `${percent}%`,
              top: "50%",
              translate: layoutRtl ? "50% -50%" : "-50% -50%",
              "--color-slider-thumb-color": thumbColor,
          };

    const onKeyDown = (event: KeyboardEvent) => {
        if (disabled) {
            return;
        }
        const target = sliderKeyTarget(event.key, event.shiftKey, value, {
            step: range.step,
            largeStep: range.largeStep,
            min: range.min,
            max: range.max,
            orientation: context.orientation,
            rtl,
        });
        if (target === null) {
            return;
        }
        event.preventDefault();
        context.commit(context.setChannelValue(target, "keyboard"));
    };

    const { field } = context;
    // the field's label (else the slider's Label) names a thumb that has no name of its own
    const named =
        props["aria-label"] !== undefined ||
        props["aria-labelledby"] !== undefined;
    return renderElement(
        "div",
        props,
        colorSliderState(context),
        {
            role: "slider",
            id: idProp ?? generated,
            tabIndex: disabled ? undefined : 0,
            "aria-valuenow": value,
            "aria-valuemin": range.min,
            "aria-valuemax": range.max,
            "aria-valuetext": context.valueText,
            "aria-orientation": context.orientation,
            "aria-disabled": disabled ? "true" : undefined,
            ...field.aria,
            "aria-labelledby": named
                ? undefined
                : (field.aria["aria-labelledby"] ?? context.labelId),
            "data-primitives-part": "color-slider-thumb",
            ...stateAttributes(colorSliderAttributes(context, true)),
            style,
            onKeyDown,
            onFocus: field.onFocus,
            onBlur: field.onBlur,
        },
        ref,
    );
}
