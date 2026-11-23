// The entry of @fragiola/primitives-vue/time-field: a time of day typed in segments
// (spec/date-field.md). Its parts are DateField's Input and Segment, from the date field's
// modules; its part attributes are `time-field-*`.

export type {
    DateSegment,
    SegmentGranularity,
    SegmentType,
} from "@fragiola/primitives/segments";
export type { PlainTime } from "@fragiola/primitives/time";
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
export type { DateFieldRootSharedProps } from "../date-field/date-field-root-base.ts";
export type { DateFieldSegmentProps } from "../date-field/date-field-segment.ts";
export { TimeField } from "./parts.ts";
export type {
    TimeFieldRootEmits,
    TimeFieldRootProps,
} from "./time-field-root.ts";
