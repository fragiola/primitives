// The entry of @fragiola/primitives-angular/slider: a number, or a range of numbers, chosen along a
// track (spec/slider.md, the APG's slider and multi-thumb slider), with its Label and formatted
// Value, as standalone attribute directives on the consumer's own elements.

export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { SliderControl } from "./directives/slider-control.directive.ts";
export { SliderIndicator } from "./directives/slider-indicator.directive.ts";
export { SliderLabel } from "./directives/slider-label.directive.ts";
export {
    SliderRoot,
    type SliderRootValue,
    type SliderState,
} from "./directives/slider-root.directive.ts";
export {
    SliderThumb,
    type SliderThumbState,
} from "./directives/slider-thumb.directive.ts";
export { SliderTrack } from "./directives/slider-track.directive.ts";
export { SliderValue } from "./directives/slider-value.directive.ts";
