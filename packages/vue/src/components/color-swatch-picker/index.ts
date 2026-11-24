// The entry of @fragiola/primitives-vue/color-swatch-picker: a palette of swatches for choosing
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
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type {
    ColorSwatchPickerItemProps,
    ColorSwatchPickerItemState,
} from "./color-swatch-picker-item.ts";
export type {
    ColorSwatchPickerRootEmits,
    ColorSwatchPickerRootProps,
    ColorSwatchPickerRootState,
} from "./color-swatch-picker-root.ts";
export { ColorSwatchPicker } from "./parts.ts";
