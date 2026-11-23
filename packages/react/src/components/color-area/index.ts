// The entry of @fragiola/primitives-react/color-area: two channels of a color chosen on a 2D
// area (spec/color-area.md: two APG sliders, one native range input per axis, on the toolkit's
// /color).

export type {
    Color,
    ColorChannel,
    ColorSpace,
    HsbColor,
    HslColor,
    RgbColor,
} from "@fragiola/primitives/color";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export type { ColorAreaAxis, ColorAreaState } from "./color-area-context.ts";
export type { ColorAreaInputProps } from "./color-area-input.tsx";
export type { ColorAreaRootProps } from "./color-area-root.tsx";
export { ColorArea } from "./parts.ts";
