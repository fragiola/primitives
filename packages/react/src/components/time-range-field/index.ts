// The entry of @fragiola/primitives-react/time-range-field: a start and an end time of day typed
// in segments (spec/date-range-field.md). Its parts are DateRangeField's Input and DateField's
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
export type { RenderProp } from "../../utils/render-element.tsx";
export type {
    DateFieldSegmentState,
    DateFieldState,
} from "../date-field/date-field-context.ts";
export type { DateFieldInputProps } from "../date-field/date-field-input.tsx";
export type { DateFieldSegmentProps } from "../date-field/date-field-segment.tsx";
export type { RangeEnd } from "../date-range-field/date-range-field-context.ts";
export type { DateRangeFieldInputProps } from "../date-range-field/date-range-field-input.tsx";
export type { DateRangeFieldRootSharedProps } from "../date-range-field/date-range-field-root-base.tsx";
export { TimeRangeField } from "./parts.ts";
export type { TimeRangeFieldRootProps } from "./time-range-field-root.tsx";
