// The entry of @fragiola/primitives-react/date-range-field: a start and an end date (and, with a
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
export type { RenderProp } from "../../utils/render-element.tsx";
export type {
    DateFieldSegmentState,
    DateFieldState,
} from "../date-field/date-field-context.ts";
export type { DateFieldInputProps } from "../date-field/date-field-input.tsx";
export type { DateFieldValue } from "../date-field/date-field-root.tsx";
export type { DateFieldSegmentProps } from "../date-field/date-field-segment.tsx";
export type { RangeEnd } from "./date-range-field-context.ts";
export type { DateRangeFieldInputProps } from "./date-range-field-input.tsx";
export type {
    DateRangeFieldRootProps,
    DateRangeFieldValue,
} from "./date-range-field-root.tsx";
export type { DateRangeFieldRootSharedProps } from "./date-range-field-root-base.tsx";
export { DateRangeField } from "./parts.ts";
