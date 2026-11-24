// The entry of @fragiola/primitives-angular/color-picker: one color shared by the color controls
// inside it, its format and an eyedropper (spec/color-picker.md, on the toolkit's /color), as
// standalone attribute directives on the consumer's own elements. Its popup is the opt-in
// `/color-picker-popover`: an inline picker bundles no overlay code (D8).

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
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { ColorPickerEyeDropperTrigger } from "./directives/color-picker-eye-dropper-trigger.directive.ts";
export { ColorPickerFormatSelect } from "./directives/color-picker-format-select.directive.ts";
export {
    type ColorPickerFormat,
    ColorPickerRoot,
    type ColorPickerState,
} from "./directives/color-picker-root.directive.ts";
