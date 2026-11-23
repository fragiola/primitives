import { DateFieldSegment } from "../date-field/date-field-segment.ts";
import { DateRangeFieldInput } from "./date-range-field-input.ts";
import { DateRangeFieldRoot } from "./date-range-field-root.ts";

/** spec/date-range-field.md: a start and an end date typed in segments, on DateField's Segment */
export const DateRangeField = {
    Root: DateRangeFieldRoot,
    Input: DateRangeFieldInput,
    Segment: DateFieldSegment,
};
