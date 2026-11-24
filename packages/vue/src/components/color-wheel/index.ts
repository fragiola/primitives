// The entry of @fragiola/primitives-vue/color-wheel: a color's hue chosen on a ring
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
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type { ColorWheelState } from "./color-wheel-context.ts";
export type {
    ColorWheelRootEmits,
    ColorWheelRootProps,
} from "./color-wheel-root.ts";
export { ColorWheel } from "./parts.ts";
