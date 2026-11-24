// The entry of @fragiola/primitives-react/color-swatch: a preview of a color, an `img` over the
// recipe's checkerboard (spec/color-swatch.md, on the toolkit's /color).

export type {
    Color,
    ColorSpace,
    HsbColor,
    HslColor,
    RgbColor,
} from "@fragiola/primitives/color";
export type { RenderProp } from "../../utils/render-element.tsx";
export {
    ColorSwatch,
    type ColorSwatchProps,
    type ColorSwatchState,
} from "./color-swatch.tsx";
