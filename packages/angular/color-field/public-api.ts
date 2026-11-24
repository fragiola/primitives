// The entry of @fragiola/primitives-angular/color-field: a color typed as hex, or one channel typed
// as a number (spec/color-field.md, on the toolkit's /color and /number), as standalone attribute
// directives on the consumer's own elements.

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
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { ColorFieldInput } from "./directives/color-field-input.directive.ts";
export {
    ColorFieldRoot,
    type ColorFieldState,
} from "./directives/color-field-root.directive.ts";
