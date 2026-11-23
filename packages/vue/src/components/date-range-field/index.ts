// The entry of @fragiola/primitives-vue/date-range-field: a start and an end date (and, with a
// time granularity, times) typed in segments, each an APG spinbutton (spec/date-range-field.md).
// Its Input holds one end's segments; its Segment is DateField's, from the date field's modules.
// It is a Field control.

export type { DateRange, PlainDate } from "@fragiola/primitives/date";
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
} from "../date-field/date-field-context.ts";
export type { DateFieldInputSlots } from "../date-field/date-field-input.ts";
export type { DateFieldValue } from "../date-field/date-field-root.ts";
export type { DateFieldSegmentProps } from "../date-field/date-field-segment.ts";
export type { RangeEnd } from "./date-range-field-context.ts";
export type { DateRangeFieldInputProps } from "./date-range-field-input.ts";
export type {
    DateRangeFieldRootEmits,
    DateRangeFieldRootProps,
    DateRangeFieldValue,
} from "./date-range-field-root.ts";
export type { DateRangeFieldRootSharedProps } from "./date-range-field-root-base.ts";
export { DateRangeField } from "./parts.ts";
