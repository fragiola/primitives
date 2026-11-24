// The entry of @fragiola/primitives-react/color-field: a color typed as hex, or one channel typed
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
export type { RenderProp } from "../../utils/render-element.tsx";
export type { ColorFieldState } from "./color-field-context.ts";
export type { ColorFieldInputProps } from "./color-field-input.tsx";
export type { ColorFieldRootProps } from "./color-field-root.tsx";
export { ColorField } from "./parts.ts";
