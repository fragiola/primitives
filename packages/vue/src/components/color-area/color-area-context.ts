import type {
    Color,
    ColorChannel,
    ColorChannelRange,
    ColorSpace,
} from "@fragiola/primitives/color";
import type { ComputedRef, InjectionKey, Ref, ShallowRef } from "vue";
import type { ChangeReason } from "../../utils/change-details.ts";

export type ColorAreaAxis = "x" | "y";

export interface ColorAreaContext {
    /** The value, in the area's space. */
    color: ComputedRef<Color>;
    space: () => ColorSpace;
    xChannel: () => ColorChannel;
    yChannel: () => ColorChannel;
    xValue: ComputedRef<number>;
    yValue: ComputedRef<number>;
    xRange: () => ColorChannelRange;
    yRange: () => ColorChannelRange;
    disabled: () => boolean;
    dragging: Ref<boolean>;
    locale: () => string | undefined;
    /** The axis whose Input is the tab stop (the last focused, x at first). */
    activeAxis: Ref<ColorAreaAxis>;
    /** Sets the axes given (snapped, clamped), reports the change, returns the color. */
    setValues: (
        values: { x?: number; y?: number },
        reason: ChangeReason,
    ) => Color;
    /** Reports the color (default: the current one) as committed. */
    commit: (color?: Color) => void;
    inputs: ShallowRef<
        Readonly<Record<ColorAreaAxis, HTMLInputElement | null>>
    >;
    registerInput: (
        axis: ColorAreaAxis,
        element: HTMLInputElement | null,
    ) => void;
}

export const ColorAreaKey: InjectionKey<ColorAreaContext> = Symbol("ColorArea");

/** The state every color area part shares. */
export interface ColorAreaState {
    /** The value, in the area's space. */
    color: Color;
    xChannel: ColorChannel;
    yChannel: ColorChannel;
    disabled: boolean;
    dragging: boolean;
}

export function colorAreaState(context: ColorAreaContext): ColorAreaState {
    return {
        color: context.color.value,
        xChannel: context.xChannel(),
        yChannel: context.yChannel(),
        disabled: context.disabled(),
        dragging: context.dragging.value,
    };
}
