// The entry of @fragiola/primitives-vue/time-range-field: a start and an end time of day typed in
// segments (spec/date-range-field.md). Its parts are DateRangeField's Input and DateField's
// Segment, from their modules; its part attributes are `time-range-field-*`.

export type {
    DateSegment,
    SegmentGranularity,
    SegmentType,
} from "@fragiola/primitives/segments";
export type { PlainTime, TimeRange } from "@fragiola/primitives/time";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type {
    DateFieldSegmentState,
    DateFieldState,
} from "../date-field/date-field-context.ts";
export type { DateFieldInputSlots } from "../date-field/date-field-input.ts";
export type { DateFieldSegmentProps } from "../date-field/date-field-segment.ts";
export type { RangeEnd } from "../date-range-field/date-range-field-context.ts";
export type { DateRangeFieldInputProps } from "../date-range-field/date-range-field-input.ts";
export type { DateRangeFieldRootSharedProps } from "../date-range-field/date-range-field-root-base.ts";
export { TimeRangeField } from "./parts.ts";
export type {
    TimeRangeFieldRootEmits,
    TimeRangeFieldRootProps,
} from "./time-range-field-root.ts";
