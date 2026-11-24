// The entry of @fragiola/primitives-react/color-swatch-picker: a palette of swatches for choosing
// one color (spec/color-swatch-picker.md, the APG listbox, on the toolkit's /selection and /color).

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
export type {
    ColorSwatchPickerItemProps,
    ColorSwatchPickerItemState,
} from "./color-swatch-picker-item.tsx";
export type {
    ColorSwatchPickerRootProps,
    ColorSwatchPickerRootState,
} from "./color-swatch-picker-root.tsx";
export { ColorSwatchPicker } from "./parts.ts";
