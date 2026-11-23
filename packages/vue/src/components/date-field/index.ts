// The entry of @fragiola/primitives-vue/date-field: a date (and, with a time granularity, a
// time) typed in segments, each an APG spinbutton (spec/date-field.md). Its segment editing and
// time values are the toolkit's `/segments` and `/time`, which only the date and time fields
// import; it is a Field control.

export type { PlainDate } from "@fragiola/primitives/date";
export type {
    DateSegment,
    SegmentGranularity,
    SegmentType,
} from "@fragiola/primitives/segments";
export type { PlainDateTime, PlainTime } from "@fragiola/primitives/time";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type {
    DateFieldSegmentState,
    DateFieldState,
} from "./date-field-context.ts";
export type { DateFieldInputSlots } from "./date-field-input.ts";
export type {
    DateFieldRootEmits,
    DateFieldRootProps,
    DateFieldValue,
} from "./date-field-root.ts";
export type { DateFieldRootSharedProps } from "./date-field-root-base.ts";
export type { DateFieldSegmentProps } from "./date-field-segment.ts";
export { DateField } from "./parts.ts";
