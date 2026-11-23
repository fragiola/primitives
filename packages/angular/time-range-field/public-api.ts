// The entry of @fragiola/primitives-angular/time-range-field: a start and an end time of day typed
// in segments (spec/date-range-field.md). Its root is its own; its parts are the DateRangeField's
// Input and the DateField's Segment, re-exported here, named `time-range-field-*` inside it.

export type {
    DateSegment,
    SegmentGranularity,
    SegmentType,
} from "@fragiola/primitives/segments";
export type { PlainTime, TimeRange } from "@fragiola/primitives/time";
export {
    DateFieldSegment,
    type DateFieldSegmentState,
    type DateFieldState,
} from "@fragiola/primitives-angular/date-field";
export {
    DateRangeFieldInput,
    type RangeEnd,
} from "@fragiola/primitives-angular/date-range-field";
export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { TimeRangeFieldRoot } from "./directives/time-range-field-root.directive.ts";
