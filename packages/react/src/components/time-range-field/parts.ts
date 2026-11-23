import { DateFieldSegment } from "../date-field/date-field-segment.tsx";
import { DateRangeFieldInput } from "../date-range-field/date-range-field-input.tsx";
import { TimeRangeFieldRoot } from "./time-range-field-root.tsx";

/** spec/date-range-field.md: a start and an end time typed in segments, on DateRangeField's Input */
export const TimeRangeField = {
    Root: TimeRangeFieldRoot,
    Input: DateRangeFieldInput,
    Segment: DateFieldSegment,
};
