import { colorChannelGradient } from "@fragiola/primitives/color";
import { getDirection } from "@fragiola/primitives/direction";
import { startDrag } from "@fragiola/primitives/pointer";
import { fractionAlong, valueAtFraction } from "@fragiola/primitives/range";
import { type PointerEvent, useContext, useEffect, useRef } from "react";
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

/**
 * The interactive area and the channel's gradient: a press moves the thumb there, then drags it
 * with pointer capture (spec/color-slider.md, "Pointer").
 */
export function ColorSliderTrack(props: PartProps<ColorSliderState>) {
    const context = useRequiredContext(ColorSliderContext, "ColorSlider.Track");
    const direction = useContext(DirectionContext);
    const [element, ref] = useElement<HTMLElement>();
    const endDrag = useRef<(() => void) | null>(null);
    useEffect(() => () => endDrag.current?.(), []);
    const latest = useRef(context);
    latest.current = context;
    const provided = useRef(direction);
    provided.current = direction;

    const rtl =
        direction !== null
            ? direction === "rtl"
            : element !== null && getDirection(element) === "rtl";
    const gradient = colorChannelGradient(
        context.color,
        context.channel,
        context.orientation === "vertical"
            ? "to top"
            : rtl
              ? "to left"
              : "to right",
    );

    const valueAt = (target: HTMLElement, x: number, y: number) => {
        const { range, orientation } = latest.current;
        const fraction = fractionAlong(
            target.getBoundingClientRect(),
            { x, y },
            orientation,
            getDirection(target, provided.current) === "rtl",
        );
        return valueAtFraction(fraction, range);
    };

    const onPointerDown = (event: PointerEvent<HTMLElement>) => {
        if (
            context.disabled ||
            (event.pointerType === "mouse" && event.button !== 0)
        ) {
            return;
        }
        event.preventDefault();
        const target = event.currentTarget;
        context.setChannelValue(
            valueAt(target, event.clientX, event.clientY),
            "track-press",
        );
        context.thumb?.focus();
        context.setDragging(true);
        endDrag.current?.();
        endDrag.current = startDrag(target, event.nativeEvent, {
            onMove: (move) =>
                latest.current.setChannelValue(
                    valueAt(target, move.clientX, move.clientY),
                    "drag",
                ),
            onEnd: () => {
                endDrag.current = null;
                latest.current.setDragging(false);
                latest.current.commit();
            },
        });
    };

    return renderElement(
        "div",
        props,
        colorSliderState(context),
        {
            "data-primitives-part": "color-slider-track",
            ...stateAttributes(colorSliderAttributes(context, true)),
            // structural: the thumb's box, no page scroll under a touch drag, the gradient a
            // recipe draws
            style: {
                position: "relative",
                touchAction: "none",
                "--color-slider-track-background": gradient,
            },
            onPointerDown,
        },
        ref,
    );
}
