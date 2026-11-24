// The entry of @fragiola/primitives-angular/color-swatch: a preview of a color, an `img` over the
// recipe's checkerboard (spec/color-swatch.md, on the toolkit's /color).

export type {
    Color,
    ColorSpace,
    HsbColor,
    HslColor,
    RgbColor,
} from "@fragiola/primitives/color";
export {
    ColorSwatch,
    type ColorSwatchState,
} from "./directives/color-swatch.directive.ts";
