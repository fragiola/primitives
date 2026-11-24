import {
    type Color,
    type ColorChannel,
    type ColorSpace,
    colorChannelRange,
    colorSpaceFor,
    convertColor,
    formatColor,
    formatColorChannel,
    getColorChannel,
    isSameColor,
    parseColor,
    setColorChannel,
} from "@fragiola/primitives/color";
import { bridgeForm } from "@fragiola/primitives/form";
import { snapToStep } from "@fragiola/primitives/range";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useFieldControl } from "../../hooks/use-field-control.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ColorSliderContext,
    type ColorSliderState,
    colorSliderAttributes,
    colorSliderState,
} from "./color-slider-context.ts";

const BLACK: Color = { space: "rgb", red: 0, green: 0, blue: 0, alpha: 1 };

/** A `Color`, or a string `parseColor` reads (black when it reads none). */
function toColor(value: Color | string | undefined): Color | undefined {
    return value === undefined ? undefined : (parseColor(value) ?? BLACK);
}

export interface ColorSliderRootProps extends PartProps<ColorSliderState> {
    value?: Color | string;
    defaultValue?: Color | string;
    onValueChange?: (value: Color, details: ChangeDetails) => void;
    /** When a drag ends, or after a key changed the value. */
    onValueCommit?: (value: Color, details: ChangeDetails) => void;
    /** The channel the slider edits. */
    channel: ColorChannel;
    /** The space it edits the channel in (default: the value's, else the channel's own). */
    colorSpace?: ColorSpace;
    orientation?: "horizontal" | "vertical";
    disabled?: boolean;
    name?: string;
    /** The locale of the channel's text (BCP 47; default: the runtime's). */
    locale?: string;
}

/**
 * Holds a color slider's value; renders the `group` and the hidden input with the color as hex
 * (spec/color-slider.md, the APG slider).
 */
export function ColorSliderRoot({
    value: valueProp,
    defaultValue = "#000000",
    onValueChange,
    onValueCommit,
    channel,
    colorSpace,
    orientation = "horizontal",
    disabled: disabledProp = false,
    name,
    locale,
    children,
    ...props
}: ColorSliderRootProps) {
    const [current, setCurrent] = useControllableState<Color, ChangeDetails>(
        toColor(valueProp),
        toColor(defaultValue) as Color,
        onValueChange,
    );
    const space = colorSpaceFor(channel, current, colorSpace);
    const color = convertColor(current, space);
    const value = getColorChannel(color, channel);
    const range = colorChannelRange(channel);
    const hex = formatColor(color, "hex");
    const input = useRef<HTMLInputElement>(null);
    const [thumb, setThumb] = useState<HTMLElement | null>(null);
    const [dragging, setDragging] = useState(false);
    const [labelId, setLabelId] = useState<string>();
    const field = useFieldControl({
        id: undefined,
        labelable: false,
        value: hex,
        // a slider always has a value
        filled: true,
        input: () => input.current,
        focusTarget: () => thumb,
    });
    const disabled = disabledProp || field.disabled;

    const latest = useRef({
        current,
        color,
        channel,
        onValueCommit,
        setCurrent,
    });
    latest.current = { current, color, channel, onValueCommit, setCurrent };

    // a form reset returns the slider to its default (spec/README.md, "Forms")
    const initial = useRef({ defaultValue, reset: field.reset });
    initial.current = { defaultValue, reset: field.reset };
    useEffect(() => {
        const element = input.current;
        if (element === null) {
            return undefined;
        }
        return bridgeForm(element, {
            reset: () => {
                const next = toColor(initial.current.defaultValue) as Color;
                // no change reported when the slider already is at its default
                if (!isSameColor(next, latest.current.current)) {
                    initial.current.reset();
                    latest.current.setCurrent(next, { reason: "none" });
                }
            },
        });
    }, []);

    const setChannelValue = useCallback(
        (next: number, reason: ChangeReason) => {
            const { color: before, channel: edited } = latest.current;
            const snapped = snapToStep(next, colorChannelRange(edited));
            if (snapped === getColorChannel(before, edited)) {
                return before;
            }
            const changed = setColorChannel(before, edited, snapped);
            latest.current.setCurrent(changed, { reason });
            return changed;
        },
        [],
    );
    const commit = useCallback((committed?: Color) => {
        const { color: now, onValueCommit: onCommit } = latest.current;
        onCommit?.(committed ?? now, { reason: "none" });
    }, []);

    const valueText = formatColorChannel(color, channel, locale, value);
    const context = useMemo(
        () => ({
            field,
            color,
            channel,
            space,
            value,
            range,
            orientation,
            disabled,
            dragging,
            valueText,
            setChannelValue,
            commit,
            thumb,
            setThumb,
            setDragging,
            labelId,
            setLabelId,
        }),
        [
            field,
            color,
            channel,
            space,
            value,
            range,
            orientation,
            disabled,
            dragging,
            valueText,
            setChannelValue,
            commit,
            thumb,
            labelId,
        ],
    );
    return (
        <ColorSliderContext.Provider value={context}>
            {renderElement(
                "div",
                {
                    ...props,
                    children: (
                        <>
                            {children}
                            <input
                                ref={input}
                                type="hidden"
                                name={field.name ?? name}
                                value={hex}
                                data-primitives-part="color-slider-input"
                            />
                        </>
                    ),
                },
                colorSliderState(context),
                {
                    role: "group",
                    // the Field's label, else the slider's own Label
                    "aria-labelledby": field.aria["aria-labelledby"] ?? labelId,
                    "data-primitives-part": "color-slider-root",
                    ...field.attributes,
                    ...stateAttributes(colorSliderAttributes(context, true)),
                },
            )}
        </ColorSliderContext.Provider>
    );
}
