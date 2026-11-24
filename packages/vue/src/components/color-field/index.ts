// The entry of @fragiola/primitives-vue/color-field: a color typed as hex, or one channel typed
// as a number (spec/color-field.md, on the toolkit's /color and /number).

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
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type { ColorFieldState } from "./color-field-context.ts";
export type {
    ColorFieldRootEmits,
    ColorFieldRootProps,
} from "./color-field-root.ts";
export { ColorField } from "./parts.ts";
