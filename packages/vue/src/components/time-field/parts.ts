import { DateFieldInput } from "../date-field/date-field-input.ts";
import { DateFieldSegment } from "../date-field/date-field-segment.ts";
import { TimeFieldRoot } from "./time-field-root.ts";

/** spec/date-field.md: a time typed in segments, on DateField's Input and Segment */
export const TimeField = {
    Root: TimeFieldRoot,
    Input: DateFieldInput,
    Segment: DateFieldSegment,
};
