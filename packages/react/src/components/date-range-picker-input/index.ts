// The entry of @fragiola/primitives-react/date-range-picker-input: a DateRangePicker whose range is
// also typed into two ends' segments (spec/calendar.md, "Typed input"), opt-in: a DateRangePicker
// without it imports neither `/segments` nor `/time`. Its Segments is the range field's Input, its
// Segment DateField's.

export type { DateRange, PlainDate } from "@fragiola/primitives/date";
export type {
    DateSegment,
    SegmentGranularity,
    SegmentType,
} from "@fragiola/primitives/segments";
export type { PlainDateTime } from "@fragiola/primitives/time";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type {
    DateFieldSegmentState,
    DateFieldState,
} from "../date-field/date-field-context.ts";
export type { DateFieldValue } from "../date-field/date-field-root.tsx";
export type { DateFieldSegmentProps } from "../date-field/date-field-segment.tsx";
export type { DatePickerInputRootSharedProps } from "../date-picker-input/date-picker-input-root-base.tsx";
export type { RangeEnd } from "../date-range-field/date-range-field-context.ts";
export type { DateRangeFieldInputProps } from "../date-range-field/date-range-field-input.tsx";
export type { DateRangeFieldValue } from "../date-range-field/date-range-field-root.tsx";
// the component it is built on, from this entry too: an app imports both from here
export { DateRangePicker } from "../date-range-picker/parts.ts";
export type { DateRangePickerInputRootProps } from "./date-range-picker-input-root.tsx";
export { DateRangePickerInput } from "./parts.ts";
