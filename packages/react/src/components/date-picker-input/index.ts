// The entry of @fragiola/primitives-react/date-picker-input: a DatePicker whose date is also typed
// into segments (spec/calendar.md, "Typed input"), opt-in: a DatePicker without it imports neither
// the segment editing (`/segments`) nor the time values (`/time`). Its Segments and Segment are
// DateField's, from the date field's modules.

export type { PlainDate } from "@fragiola/primitives/date";
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
export type { DateFieldInputProps } from "../date-field/date-field-input.tsx";
export type { DateFieldValue } from "../date-field/date-field-root.tsx";
export type { DateFieldSegmentProps } from "../date-field/date-field-segment.tsx";
// the component it is built on, from this entry too: an app imports both from here
export { DatePicker } from "../date-picker/parts.ts";
export type { DatePickerInputRootProps } from "./date-picker-input-root.tsx";
export type { DatePickerInputRootSharedProps } from "./date-picker-input-root-base.tsx";
export { DatePickerInput } from "./parts.ts";
