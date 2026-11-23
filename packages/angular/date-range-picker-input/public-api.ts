// The entry of @fragiola/primitives-angular/date-range-picker-input: a DateRangePicker whose range
// is also typed into two ends' segments (spec/calendar.md, "Typed input"), opt-in: a
// DateRangePicker without it imports neither `/segments` nor `/time`. Its Segments is the range
// field's Input directive, its Segment the DateField's, re-exported here; the DateRangePicker's
// parts too (the component it is built on).

export type {
    DateSegment,
    SegmentGranularity,
    SegmentType,
} from "@fragiola/primitives/segments";
export type { PlainDateTime } from "@fragiola/primitives/time";
export {
    DateFieldSegment,
    type DateFieldSegmentState,
    type DateFieldState,
    type DateFieldValue,
} from "@fragiola/primitives-angular/date-field";
export {
    DateRangeFieldInput,
    type DateRangeFieldValue,
    type RangeEnd,
} from "@fragiola/primitives-angular/date-range-field";
export * from "@fragiola/primitives-angular/date-range-picker";
export { DateRangePickerInputRoot } from "./directives/date-range-picker-input-root.directive.ts";
