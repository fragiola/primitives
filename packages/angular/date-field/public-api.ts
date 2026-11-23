// The entry of @fragiola/primitives-angular/date-field: a date (and, with a time granularity, a
// time) typed in segments, each an APG spinbutton (spec/date-field.md), as standalone directives
// on the consumer's own elements. Its parts serve the TimeField too (`/time-field`), and its root
// state is the lower layer the time field builds on. Its segment editing and time values are the
// toolkit's `/segments` and `/time`, which only the date and time fields import; it is a Field
// control.

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
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { DateFieldInput } from "./directives/date-field-input.directive.ts";
export {
    DateFieldRoot,
    type DateFieldValue,
} from "./directives/date-field-root.directive.ts";
export { DateFieldRootBase } from "./directives/date-field-root-base.ts";
export { DateFieldSegment } from "./directives/date-field-segment.directive.ts";
export {
    DATE_FIELD,
    type DateFieldComponent,
    type DateFieldInputs,
    DateFieldRootState,
    type DateFieldSegmentState,
    stateData,
} from "./utils/date-field-state.ts";
export { documentLocale } from "./utils/document-locale.ts";
export {
    boundIso,
    compareValues,
    composeSegments,
    type FieldValue,
    isOutOfRange,
    isoOf,
} from "./utils/field-value.ts";
export {
    type DateFieldData,
    type DateFieldParts,
    type DateFieldState,
    editReason,
    type SegmentEditKind,
    SegmentGroup,
    type SegmentGroupOwner,
} from "./utils/segment-group.ts";
