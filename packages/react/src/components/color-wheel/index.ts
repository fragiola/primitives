// The entry of @fragiola/primitives-react/color-wheel: a color's hue chosen on a ring
// (spec/color-wheel.md, the APG slider on a circle, on the toolkit's /color).

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
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export type { ColorWheelState } from "./color-wheel-context.ts";
export type { ColorWheelRootProps } from "./color-wheel-root.tsx";
export { ColorWheel } from "./parts.ts";
