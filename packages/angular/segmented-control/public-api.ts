// The entry of @fragiola/primitives-angular/segmented-control: a single choice among segments with
// a moving Indicator (spec/segmented-control.md, the APG radio group), as standalone directives on
// the consumer's own elements. Its keys are the toolkit's `/collection` (`radioKeyTarget`), as
// RadioGroup's, and so is its Indicator's measurement.

export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export {
    SegmentedControlIndicator,
    type SegmentedControlIndicatorState,
} from "./directives/segmented-control-indicator.directive.ts";
export {
    SegmentedControlItem,
    type SegmentedControlItemState,
} from "./directives/segmented-control-item.directive.ts";
export { SegmentedControlItemText } from "./directives/segmented-control-item-text.directive.ts";
export {
    type SegmentedControlItemEntry,
    type SegmentedControlOrientation,
    SegmentedControlRoot,
    type SegmentedControlRootState,
} from "./directives/segmented-control-root.directive.ts";
