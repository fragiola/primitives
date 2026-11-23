// The entry of @fragiola/primitives-angular/date-picker-input: a DatePicker whose date is also
// typed into segments (spec/calendar.md, "Typed input"), opt-in: a DatePicker without it imports
// neither the segment editing (`/segments`) nor the time values (`/time`). Its Segments and
// Segment are the DateField's directives (`/date-field`), re-exported here; the DatePicker's parts
// too (the component it is built on: an app imports both from here). Its state is the lower layer
// the typed range picker builds on.

export type {
    DateSegment,
    SegmentGranularity,
    SegmentType,
} from "@fragiola/primitives/segments";
export type { PlainDateTime } from "@fragiola/primitives/time";
export {
    DateFieldInput,
    DateFieldSegment,
    type DateFieldSegmentState,
    type DateFieldState,
    type DateFieldValue,
} from "@fragiola/primitives-angular/date-field";
export * from "@fragiola/primitives-angular/date-picker";
export {
    DatePickerInputRoot,
    hourCycleAttribute,
} from "./directives/date-picker-input-root.directive.ts";
export {
    type DatePickerInputInputs,
    DatePickerInputState,
    type PickerValue,
} from "./utils/date-picker-input-state.ts";
