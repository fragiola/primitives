// The entry of @fragiola/primitives-react/time-field: a time of day typed in segments
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
export type { RenderProp } from "../../utils/render-element.tsx";
export type {
    DateFieldSegmentState,
    DateFieldState,
} from "../date-field/date-field-context.ts";
export type { DateFieldInputProps } from "../date-field/date-field-input.tsx";
export type { DateFieldRootSharedProps } from "../date-field/date-field-root-base.tsx";
export type { DateFieldSegmentProps } from "../date-field/date-field-segment.tsx";
export { TimeField } from "./parts.ts";
export type { TimeFieldRootProps } from "./time-field-root.tsx";
