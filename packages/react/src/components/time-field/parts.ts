import { DateFieldInput } from "../date-field/date-field-input.tsx";
import { DateFieldSegment } from "../date-field/date-field-segment.tsx";
import { TimeFieldRoot } from "./time-field-root.tsx";

/** spec/date-field.md: a time typed in segments, on DateField's Input and Segment */
export const TimeField = {
    Root: TimeFieldRoot,
    Input: DateFieldInput,
    Segment: DateFieldSegment,
};
