// The entry of @fragiola/primitives-angular/color-wheel: a hue chosen on a ring (spec/color-wheel.md,
// the APG slider on a ring, on the toolkit's /color), as standalone attribute directives on the
// consumer's own elements.

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
export {
    ColorWheelRoot,
    type ColorWheelState,
} from "./directives/color-wheel-root.directive.ts";
export { ColorWheelThumb } from "./directives/color-wheel-thumb.directive.ts";
export { ColorWheelTrack } from "./directives/color-wheel-track.directive.ts";
