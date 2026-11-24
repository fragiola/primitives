// The entry of @fragiola/primitives-vue/color-swatch: a preview of a color, an `img` over the
// recipe's checkerboard (spec/color-swatch.md, on the toolkit's /color).

export type {
    Color,
    ColorSpace,
    HsbColor,
    HslColor,
    RgbColor,
} from "@fragiola/primitives/color";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export {
    ColorSwatch,
    type ColorSwatchProps,
    type ColorSwatchState,
} from "./color-swatch.ts";
