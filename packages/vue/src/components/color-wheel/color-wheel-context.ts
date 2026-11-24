import type { Color } from "@fragiola/primitives/color";
import type { ComputedRef, InjectionKey, Ref, ShallowRef } from "vue";
import type { ChangeReason } from "../../utils/change-details.ts";

export interface ColorWheelContext {
    /** The value, in the wheel's space (hsl or hsb). */
    color: ComputedRef<Color>;
    hue: ComputedRef<number>;
    outerRadius: () => number;
    innerRadius: () => number;
    disabled: () => boolean;
    dragging: Ref<boolean>;
    /** The hue's text (`Intl`, spec/color.md). */
    valueText: ComputedRef<string>;
    /** Sets the hue (wrapped into [0, 360), snapped), reports it, returns the color. */
    setHue: (hue: number, reason: ChangeReason) => Color;
    /** Reports the color (default: the current one) as committed. */
    commit: (color?: Color) => void;
    /** The Thumb's element, once rendered (the press focuses it). */
    thumb: ShallowRef<HTMLElement | null>;
}

export const ColorWheelKey: InjectionKey<ColorWheelContext> =
    Symbol("ColorWheel");

/** The state every color wheel part shares. */
export interface ColorWheelState {
    /** The value, in the wheel's space. */
    color: Color;
    hue: number;
    disabled: boolean;
    dragging: boolean;
}

export function colorWheelState(context: ColorWheelContext): ColorWheelState {
    return {
        color: context.color.value,
        hue: context.hue.value,
        disabled: context.disabled(),
        dragging: context.dragging.value,
    };
}
