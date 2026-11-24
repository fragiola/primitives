import {
    colorWheelKeyTarget,
    colorWheelThumbOffset,
    formatColor,
    setColorChannel,
} from "@fragiola/primitives/color";
import { type KeyboardEvent, useLayoutEffect } from "react";
import { useElement } from "../../hooks/use-element.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ColorWheelContext,
    type ColorWheelState,
    colorWheelState,
} from "./color-wheel-context.ts";

/** The `slider`: the hue, on the ring's middle circle (spec/color-wheel.md). */
export function ColorWheelThumb(props: PartProps<ColorWheelState>) {
    const context = useRequiredContext(ColorWheelContext, "ColorWheel.Thumb");
    const [element, ref] = useElement<HTMLElement>();
    const { setThumb } = context;
    useLayoutEffect(() => {
        setThumb(element);
        return () => setThumb(null);
    }, [element, setThumb]);

    const { hue, disabled } = context;
    const offset = colorWheelThumbOffset(
        hue,
        (context.innerRadius + context.outerRadius) / 2,
    );

    const onKeyDown = (event: KeyboardEvent) => {
        if (disabled) {
            return;
        }
        const target = colorWheelKeyTarget(event.key, event.shiftKey, hue);
        if (target === null) {
            return;
        }
        event.preventDefault();
        context.commit(context.setHue(target, "keyboard"));
    };

    return renderElement(
        "div",
        props,
        colorWheelState(context),
        {
            role: "slider",
            tabIndex: disabled ? undefined : 0,
            "aria-valuenow": hue,
            "aria-valuemin": 0,
            "aria-valuemax": 360,
            "aria-valuetext": context.valueText,
            "aria-disabled": disabled ? "true" : undefined,
            "data-primitives-part": "color-wheel-thumb",
            ...stateAttributes({ disabled, dragging: context.dragging }),
            // structural: its centre on the hue's point of the ring, and its color for the recipe
            style: {
                position: "absolute",
                left: `calc(50% + ${offset.x}px)`,
                top: `calc(50% + ${offset.y}px)`,
                translate: "-50% -50%",
                "--color-wheel-thumb-color": formatColor(
                    setColorChannel(context.color, "alpha", 1),
                ),
            },
            onKeyDown,
        },
        ref,
    );
}
