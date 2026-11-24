import type {
    Color,
    ColorChannel,
    ColorChannelRange,
    ColorSpace,
} from "@fragiola/primitives/color";
import type { ComputedRef, InjectionKey, Ref, ShallowRef } from "vue";
import type { FieldControlBinding } from "../../composables/use-field-control.ts";
import type { ChangeReason } from "../../utils/change-details.ts";

export interface ColorSliderContext {
    /** The enclosing field's binding, for the thumb (spec/field.md). */
    field: FieldControlBinding;
    /** The value, in the slider's space. */
    color: ComputedRef<Color>;
    channel: () => ColorChannel;
    space: ComputedRef<ColorSpace>;
    /** The channel's value. */
    value: ComputedRef<number>;
    range: ComputedRef<ColorChannelRange>;
    orientation: () => "horizontal" | "vertical";
    disabled: () => boolean;
    dragging: Ref<boolean>;
    /** The channel's text (`Intl`, spec/color.md). */
    valueText: ComputedRef<string>;
    /** Sets the channel to `value` (snapped, clamped), reports it, returns the color. */
    setChannelValue: (value: number, reason: ChangeReason) => Color;
    /** Reports the color (default: the current one) as committed. */
    commit: (color?: Color) => void;
    /** The Thumb's element, once rendered (the Output's `for`, the focus target). */
    thumb: ShallowRef<HTMLElement | null>;
    /** The Label's id, while one is rendered. */
    labelId: Ref<string | undefined>;
}

export const ColorSliderKey: InjectionKey<ColorSliderContext> =
    Symbol("ColorSlider");

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
    context: ColorSliderContext,
): ColorSliderState {
    return {
        color: context.color.value,
        channel: context.channel(),
        value: context.value.value,
        orientation: context.orientation(),
        disabled: context.disabled(),
        dragging: context.dragging.value,
    };
}

/** The data attributes every part carries (`dragging` only on the Root, Track and Thumb). */
export function colorSliderAttributes(
    context: ColorSliderContext,
    dragging = false,
) {
    return {
        orientation: context.orientation(),
        channel: context.channel(),
        disabled: context.disabled(),
        dragging: dragging && context.dragging.value,
    };
}
