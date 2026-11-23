// The entry of @fragiola/primitives-angular/time-field: a time of day typed in segments
// (spec/date-field.md). Its root is its own; its parts are the DateField's directives
// (`@fragiola/primitives-angular/date-field`), re-exported here, named `time-field-*` inside it.

export type {
    DateSegment,
    SegmentGranularity,
    SegmentType,
} from "@fragiola/primitives/segments";
export type { PlainTime } from "@fragiola/primitives/time";
export {
    DateFieldInput,
    DateFieldSegment,
    type DateFieldSegmentState,
    type DateFieldState,
} from "@fragiola/primitives-angular/date-field";
export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { TimeFieldRoot } from "./directives/time-field-root.directive.ts";
