import type { Color } from "@fragiola/primitives/color";
import type { InjectionKey } from "vue";
import type { ChangeDetails } from "./change-details.ts";

/**
 * What a ColorPicker's Root shares with the color controls inside it (spec/color-picker.md,
 * "Sharing the color"). It lives in the package's shared code, as the roving scope does, so a
 * color control used alone carries none of ColorPicker's code (D8).
 */
export interface ColorPickerBinding {
    /** The picker's color. */
    value: () => Color;
    /** A bound control changed it. */
    setValue: (color: Color, details: ChangeDetails) => void;
    /** A bound control's change is complete. */
    commit: (color: Color, details: ChangeDetails) => void;
    /** Every control inside is disabled. */
    disabled: () => boolean;
    /**
     * The picker's popup (its positioner, teleported out of the Root) is part of the picker: focus
     * in it is focus in the picker's Field control. Returns its cleanup.
     */
    registerPopup: (element: HTMLElement) => () => void;
}

export const ColorPickerBindingKey: InjectionKey<ColorPickerBinding> =
    Symbol("ColorPickerBinding");
