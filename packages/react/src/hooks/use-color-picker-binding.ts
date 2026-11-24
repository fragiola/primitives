import { useContext } from "react";
import {
    type ColorPickerBinding,
    ColorPickerBindingContext,
} from "../utils/color-picker-binding.ts";

export interface ColorPickerBindingState {
    /** The enclosing ColorPicker's binding, or `null` outside one. */
    picker: ColorPickerBinding | null;
    /** The control shows and sets the picker's color: it has neither `value` nor `defaultValue`. */
    bound: ColorPickerBinding | null;
}

/**
 * The ColorPicker a color control is inside (spec/color-picker.md, "Sharing the color"): it is
 * bound to it unless it was given its own `value` or `defaultValue` (`own`).
 */
export function useColorPickerBinding(own: boolean): ColorPickerBindingState {
    const picker = useContext(ColorPickerBindingContext);
    return { picker, bound: own ? null : picker };
}
