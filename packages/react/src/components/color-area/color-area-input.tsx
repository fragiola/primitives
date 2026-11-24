import {
    colorAreaKeyTarget,
    formatColorChannel,
} from "@fragiola/primitives/color";
import { getDirection } from "@fragiola/primitives/direction";
import { VISUALLY_HIDDEN_INPUT_STYLE } from "@fragiola/primitives/form";
import {
    type ChangeEvent,
    type KeyboardEvent,
    useContext,
    useLayoutEffect,
} from "react";
import { DirectionContext } from "../../direction/direction-context.ts";
import { useElement } from "../../hooks/use-element.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    type ColorAreaAxis,
    ColorAreaContext,
    type ColorAreaState,
    colorAreaState,
} from "./color-area-context.ts";

export interface ColorAreaInputProps extends PartProps<ColorAreaState> {
    /** The axis this slider is: `x` or `y`. */
    axis: ColorAreaAxis;
    /** What the form submits its channel's value as. */
    name?: string;
}

/**
 * One axis's `slider`: a native range input, visually hidden in the Thumb; every key moves the
 * axis it names, and the focus follows it (spec/color-area.md, "Keyboard").
 */
export function ColorAreaInput({ axis, ...props }: ColorAreaInputProps) {
    const context = useRequiredContext(ColorAreaContext, "ColorArea.Input");
    const direction = useContext(DirectionContext);
    const [element, ref] = useElement<HTMLInputElement>();
    const { registerInput } = context;
    useLayoutEffect(() => {
        registerInput(axis, element);
        return () => registerInput(axis, null);
    }, [axis, element, registerInput]);

    const channel = axis === "x" ? context.xChannel : context.yChannel;
    const range = axis === "x" ? context.xRange : context.yRange;
    const value = axis === "x" ? context.xValue : context.yValue;

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (context.disabled) {
            return;
        }
        const rtl = getDirection(event.currentTarget, direction) === "rtl";
        const target = colorAreaKeyTarget(event.key, event.shiftKey, {
            x: context.xValue,
            y: context.yValue,
            xRange: context.xRange,
            yRange: context.yRange,
            rtl,
        });
        if (target === null) {
            return;
        }
        // the native range keys never run
        event.preventDefault();
        const color = context.setValues(
            { [target.axis]: target.value },
            "keyboard",
        );
        context.commit(color);
        if (target.axis !== axis) {
            // the focus follows the axis the key moved
            context.inputs[target.axis]?.focus();
        }
    };

    return renderElement(
        "input",
        props,
        colorAreaState(context),
        {
            type: "range",
            min: range.min,
            max: range.max,
            step: range.step,
            value: String(value),
            "aria-valuetext": formatColorChannel(
                context.color,
                channel,
                context.locale,
                value,
            ),
            "aria-orientation": axis === "x" ? "horizontal" : "vertical",
            tabIndex: context.activeAxis === axis ? 0 : -1,
            disabled: context.disabled || undefined,
            "data-primitives-part": "color-area-input",
            ...stateAttributes({ axis, channel, disabled: context.disabled }),
            style: VISUALLY_HIDDEN_INPUT_STYLE,
            onKeyDown,
            // an assistive technology's own change of the slider
            onChange: (event: ChangeEvent<HTMLInputElement>) => {
                const color = context.setValues(
                    { [axis]: Number(event.currentTarget.value) },
                    "keyboard",
                );
                context.commit(color);
            },
            onFocus: () => context.setActiveAxis(axis),
        },
        ref as (node: HTMLElement | null) => void,
    );
}
