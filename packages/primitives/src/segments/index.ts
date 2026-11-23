// The entry of @fragiola/primitives/segments: the segment editing of the date and time fields.
// A field's format from `Intl.DateTimeFormat#formatToParts` (order, literals, hour cycle, digits,
// day periods, names), its segment values and their steps, typing and erasing, the segments to
// render, the keys, and the focus moves between segments. Only the date and time fields import it.

export {
    type DateSegment,
    dateSegments,
    SEGMENT_PLACEHOLDER,
} from "./date-segments.ts";
export {
    focusOnLabelPress,
    type SegmentMove,
    segmentTarget,
} from "./segment-focus.ts";
export {
    type EditableSegmentType,
    type HourCycle,
    type SegmentFormat,
    type SegmentFormatOptions,
    type SegmentGranularity,
    type SegmentKind,
    type SegmentPart,
    type SegmentType,
    segmentFormat,
} from "./segment-format.ts";
export { type SegmentKeyResult, segmentKeyDown } from "./segment-keys.ts";
export {
    eraseSegment,
    type SegmentEdit,
    type SegmentEraseResult,
    type SegmentTypeResult,
    segmentDigit,
    typeSegment,
} from "./segment-typing.ts";
export {
    displayHour,
    isSegmentsComplete,
    SEGMENT_PAGE_STEPS,
    type SegmentRange,
    type SegmentValues,
    segmentRange,
    segmentsToDate,
    segmentsToDateTime,
    segmentsToTime,
    segmentToEdge,
    segmentValuesOf,
    setSegment,
    shownValue,
    stepSegment,
} from "./segment-values.ts";
