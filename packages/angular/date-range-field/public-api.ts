// The entry of @fragiola/primitives-angular/date-range-field: a start and an end date (and, with a
// time granularity, times) typed in segments, each an APG spinbutton (spec/date-range-field.md),
// as standalone directives on the consumer's own elements. Its Input holds one end's segments; its
// Segment is the DateField's directive (`/date-field`), re-exported here. Its root state is the
// lower layer the time range field builds on. It is a Field control.

export type { DateRange, PlainDate } from "@fragiola/primitives/date";
export type {
    DateSegment,
    SegmentGranularity,
    SegmentType,
} from "@fragiola/primitives/segments";
export type { PlainDateTime, PlainTime } from "@fragiola/primitives/time";
export {
    DateFieldSegment,
    type DateFieldSegmentState,
    type DateFieldState,
    type DateFieldValue,
} from "@fragiola/primitives-angular/date-field";
export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { DateRangeFieldInput } from "./directives/date-range-field-input.directive.ts";
export {
    DateRangeFieldRoot,
    type DateRangeFieldValue,
} from "./directives/date-range-field-root.directive.ts";
export { DateRangeFieldRootBase } from "./directives/date-range-field-root-base.ts";
export {
    type DateRangeFieldInputs,
    DateRangeFieldRootState,
} from "./utils/date-range-field-state.ts";
export {
    composeRange,
    edgeOf,
    type FieldRange,
    isRangeInvalid,
    type RangeEnd,
    rangeIso,
} from "./utils/field-range.ts";
export {
    DATE_RANGE_FIELD,
    RangeEndParts,
    type RangeGroups,
} from "./utils/range-end-parts.ts";
