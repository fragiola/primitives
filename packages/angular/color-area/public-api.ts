// The entry of @fragiola/primitives-angular/color-area: two channels of a color chosen on a 2D area
// (spec/color-area.md: two APG sliders, one native range input per axis, on the toolkit's /color),
// as standalone attribute directives on the consumer's own elements.

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
export { ColorAreaInput } from "./directives/color-area-input.directive.ts";
export {
    type ColorAreaAxis,
    ColorAreaRoot,
    type ColorAreaState,
} from "./directives/color-area-root.directive.ts";
export { ColorAreaThumb } from "./directives/color-area-thumb.directive.ts";
