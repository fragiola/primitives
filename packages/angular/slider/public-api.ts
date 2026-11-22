// The entry of @fragiola/primitives-angular/slider: a number, or a range of numbers, chosen along a
// track (spec/slider.md, the APG's slider and multi-thumb slider), as standalone attribute
// directives on the consumer's own elements.

export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { SliderControl } from "./directives/slider-control.directive.ts";
export { SliderIndicator } from "./directives/slider-indicator.directive.ts";
export {
    SliderRoot,
    type SliderState,
    type SliderValue,
} from "./directives/slider-root.directive.ts";
export {
    SliderThumb,
    type SliderThumbState,
} from "./directives/slider-thumb.directive.ts";
export { SliderTrack } from "./directives/slider-track.directive.ts";
