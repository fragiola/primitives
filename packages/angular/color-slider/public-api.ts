// The entry of @fragiola/primitives-angular/color-slider: one channel of a color chosen along a
// track that shows it (spec/color-slider.md, the APG slider, on the toolkit's /color), as
// standalone attribute directives on the consumer's own elements.

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
export { ColorSliderLabel } from "./directives/color-slider-label.directive.ts";
export { ColorSliderOutput } from "./directives/color-slider-output.directive.ts";
export {
    ColorSliderRoot,
    type ColorSliderState,
} from "./directives/color-slider-root.directive.ts";
export { ColorSliderThumb } from "./directives/color-slider-thumb.directive.ts";
export { ColorSliderTrack } from "./directives/color-slider-track.directive.ts";
