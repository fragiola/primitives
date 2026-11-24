// The entry of @fragiola/primitives-angular/color-swatch-picker: a palette of swatches for
// choosing one color (spec/color-swatch-picker.md, the APG listbox, on the toolkit's /selection
// and /color), as standalone attribute directives on the consumer's own elements.

export type {
    Color,
    ColorSpace,
    HsbColor,
    HslColor,
    RgbColor,
} from "@fragiola/primitives/color";
export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export {
    ColorSwatchPickerItem,
    type ColorSwatchPickerItemState,
} from "./directives/color-swatch-picker-item.directive.ts";
export {
    ColorSwatchPickerRoot,
    type ColorSwatchPickerRootState,
} from "./directives/color-swatch-picker-root.directive.ts";
