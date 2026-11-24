import type { Color } from "@fragiola/primitives/color";
import type { InjectionKey, Ref } from "vue";

/** The picker's format: which channel controls the app shows (spec/color-picker.md, "The format"). */
export type ColorPickerFormat = "hex" | "rgb" | "hsl" | "hsb";

export const COLOR_PICKER_FORMATS: readonly ColorPickerFormat[] = [
    "hex",
    "rgb",
    "hsl",
    "hsb",
];

/** The state every ColorPicker part renders with. */
export interface ColorPickerState {
    /** The picker's color. */
    color: Color;
    format: ColorPickerFormat;
    disabled: boolean;
}

export interface ColorPickerContext {
    state: () => ColorPickerState;
    /** The Root's element, once mounted (the eyedropper's API is read on its window). */
    root: Ref<HTMLElement | null>;
    /** The FormatSelect chose a format: it converts the value to the format's space. */
    setFormat: (format: ColorPickerFormat, event: Event) => void;
    /** The eyedropper picked a color: set in the value's space, its alpha kept, and committed. */
    pick: (color: Color, event: Event | undefined) => void;
}

export const ColorPickerKey: InjectionKey<ColorPickerContext> =
    Symbol("ColorPicker");
