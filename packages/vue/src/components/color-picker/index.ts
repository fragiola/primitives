// The entry of @fragiola/primitives-vue/color-picker: one color shared by the color controls
// inside it, its format and an eyedropper (spec/color-picker.md, on the toolkit's /color). Its
// popup is the opt-in `/color-picker-popover`: an inline picker bundles no overlay code (D8).

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
    ColorPickerFormat,
    ColorPickerState,
} from "./color-picker-context.ts";
export type { ColorPickerEyeDropperTriggerProps } from "./color-picker-eye-dropper-trigger.ts";
export type { ColorPickerFormatSelectProps } from "./color-picker-format-select.ts";
export type {
    ColorPickerRootEmits,
    ColorPickerRootProps,
} from "./color-picker-root.ts";
export { ColorPicker } from "./parts.ts";
