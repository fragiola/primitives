import type { Color } from "@fragiola/primitives/color";
import { createContext } from "react";
import type { ChangeReason } from "../../utils/change-details.ts";

export interface ColorWheelContextValue {
    /** The value, in the wheel's space (hsl or hsb). */
    color: Color;
    hue: number;
    outerRadius: number;
    innerRadius: number;
    disabled: boolean;
    dragging: boolean;
    /** The hue's text (`Intl`, spec/color.md). */
    valueText: string;
    /** Sets the hue (wrapped into [0, 360), snapped), reports it, returns the color. */
    setHue: (hue: number, reason: ChangeReason) => Color;
    /** Reports the color (default: the current one) as committed. */
    commit: (color?: Color) => void;
    thumb: HTMLElement | null;
    setThumb: (element: HTMLElement | null) => void;
}

export const ColorWheelContext = createContext<ColorWheelContextValue | null>(
    null,
);

/** The state every color wheel part shares. */
export interface ColorWheelState {
    /** The value, in the wheel's space. */
    color: Color;
    hue: number;
    disabled: boolean;
    dragging: boolean;
}

export function colorWheelState(
    context: ColorWheelContextValue,
): ColorWheelState {
    return {
        color: context.color,
        hue: context.hue,
        disabled: context.disabled,
        dragging: context.dragging,
    };
}
