// The entry of @fragiola/primitives-vue/segmented-control: a single choice among segments with a
// moving Indicator (spec/segmented-control.md, the APG radio group). Its keys are the toolkit's
// `/collection` (`radioKeyTarget`), as RadioGroup's, and so is its Indicator's measurement.

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export { SegmentedControl } from "./parts.ts";
export type {
    SegmentedControlIndicatorProps,
    SegmentedControlIndicatorState,
} from "./segmented-control-indicator.ts";
export type {
    SegmentedControlItemProps,
    SegmentedControlItemState,
} from "./segmented-control-item.ts";
export type {
    SegmentedControlRootEmits,
    SegmentedControlRootProps,
    SegmentedControlRootState,
} from "./segmented-control-root.ts";
