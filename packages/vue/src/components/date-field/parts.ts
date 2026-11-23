import { DateFieldInput } from "./date-field-input.ts";
import { DateFieldRoot } from "./date-field-root.ts";
import { DateFieldSegment } from "./date-field-segment.ts";

/** spec/date-field.md: a date typed in segments */
export const DateField = {
    Root: DateFieldRoot,
    Input: DateFieldInput,
    Segment: DateFieldSegment,
};
