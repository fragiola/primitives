import type {
    Color,
    ColorChannel,
    ColorChannelRange,
    ColorSpace,
} from "@fragiola/primitives/color";
import { createContext } from "react";
import type { ChangeReason } from "../../utils/change-details.ts";

export type ColorAreaAxis = "x" | "y";

export interface ColorAreaContextValue {
    /** The value, in the area's space. */
    color: Color;
    space: ColorSpace;
    xChannel: ColorChannel;
    yChannel: ColorChannel;
    xValue: number;
    yValue: number;
    xRange: ColorChannelRange;
    yRange: ColorChannelRange;
    disabled: boolean;
    dragging: boolean;
    locale: string | undefined;
    /** The axis whose Input is the tab stop (the last focused, x at first). */
    activeAxis: ColorAreaAxis;
    setActiveAxis: (axis: ColorAreaAxis) => void;
    /** Sets the axes given (snapped, clamped), reports the change, returns the color. */
    setValues: (
        values: { x?: number; y?: number },
        reason: ChangeReason,
    ) => Color;
    /** Reports the color (default: the current one) as committed. */
    commit: (color?: Color) => void;
    inputs: Readonly<Record<ColorAreaAxis, HTMLInputElement | null>>;
    registerInput: (
        axis: ColorAreaAxis,
        element: HTMLInputElement | null,
    ) => void;
}

export const ColorAreaContext = createContext<ColorAreaContextValue | null>(
    null,
);

/** The state every color area part shares. */
export interface ColorAreaState {
    /** The value, in the area's space. */
    color: Color;
    xChannel: ColorChannel;
    yChannel: ColorChannel;
    disabled: boolean;
    dragging: boolean;
}

export function colorAreaState(context: ColorAreaContextValue): ColorAreaState {
    return {
        color: context.color,
        xChannel: context.xChannel,
        yChannel: context.yChannel,
        disabled: context.disabled,
        dragging: context.dragging,
    };
}
