import { InjectionToken, inject, type Signal } from "@angular/core";
import type { Color } from "@fragiola/primitives/color";
import type { ChangeDetails } from "./change-details.ts";

/**
 * What a `[colorPickerRoot]` shares with the color controls inside it (spec/color-picker.md,
 * "Sharing the color"). The token lives in the package's shared code, as a ToggleGroup's does, so
 * a color control used alone ships none of ColorPicker's code (D8).
 */
export interface ColorPickerBinding {
    /** The picker's color. */
    readonly value: Signal<Color>;
    /** Every control inside is disabled. */
    readonly disabled: Signal<boolean>;
    /** A bound control changed it. */
    setValue: (color: Color, details: ChangeDetails) => void;
    /** A bound control's change is complete. */
    commit: (color: Color, details: ChangeDetails) => void;
}

// pure: an entry that never injects it bundles none of it (every other entry's size stays as it
// was, docs/size.md)
export const COLOR_PICKER_BINDING =
    /* @__PURE__ */ new InjectionToken<ColorPickerBinding>(
        "ColorPickerBinding",
    );

/** The enclosing ColorPicker's binding, or `null` outside one. */
export function injectColorPickerBinding(): ColorPickerBinding | null {
    return inject(COLOR_PICKER_BINDING, { optional: true });
}
