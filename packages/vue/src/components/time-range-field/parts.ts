import { DateFieldSegment } from "../date-field/date-field-segment.ts";
import { DateRangeFieldInput } from "../date-range-field/date-range-field-input.ts";
import { TimeRangeFieldRoot } from "./time-range-field-root.ts";

/** spec/date-range-field.md: a start and an end time typed in segments, on DateRangeField's Input */
export const TimeRangeField = {
    Root: TimeRangeFieldRoot,
    Input: DateRangeFieldInput,
    Segment: DateFieldSegment,
};
