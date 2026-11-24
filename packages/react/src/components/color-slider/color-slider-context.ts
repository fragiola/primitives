import type {
    Color,
    ColorChannel,
    ColorChannelRange,
    ColorSpace,
} from "@fragiola/primitives/color";
import { createContext } from "react";
import type { FieldControlBinding } from "../../hooks/use-field-control.ts";
import type { ChangeReason } from "../../utils/change-details.ts";

export interface ColorSliderContextValue {
    /** The enclosing field's binding, for the thumb (spec/field.md). */
    field: FieldControlBinding;
    /** The value, in the slider's space. */
    color: Color;
    channel: ColorChannel;
    space: ColorSpace;
    /** The channel's value. */
    value: number;
    range: ColorChannelRange;
    orientation: "horizontal" | "vertical";
    disabled: boolean;
    dragging: boolean;
    /** The channel's text (`Intl`, spec/color.md). */
    valueText: string;
    /** Sets the channel to `value` (snapped, clamped), reports it, returns the color. */
    setChannelValue: (value: number, reason: ChangeReason) => Color;
    /** Reports the color (default: the current one) as committed. */
    commit: (color?: Color) => void;
    thumb: HTMLElement | null;
    setThumb: (element: HTMLElement | null) => void;
    setDragging: (dragging: boolean) => void;
    /** The Label's id, while one is rendered. */
    labelId: string | undefined;
    setLabelId: (id: string | undefined) => void;
}

export const ColorSliderContext = createContext<ColorSliderContextValue | null>(
    null,
);

/** The state every color slider part shares. */
export interface ColorSliderState {
    /** The value, in the slider's space. */
    color: Color;
    channel: ColorChannel;
    value: number;
    orientation: "horizontal" | "vertical";
    disabled: boolean;
    dragging: boolean;
}

export function colorSliderState(
    context: ColorSliderContextValue,
): ColorSliderState {
    return {
        color: context.color,
        channel: context.channel,
        value: context.value,
        orientation: context.orientation,
        disabled: context.disabled,
        dragging: context.dragging,
    };
}

/** The data attributes every part carries. */
export function colorSliderAttributes(
    context: ColorSliderContextValue,
    dragging = false,
) {
    return {
        orientation: context.orientation,
        channel: context.channel,
        disabled: context.disabled,
        dragging: dragging && context.dragging,
    };
}
