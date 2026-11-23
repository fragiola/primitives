import { DateFieldSegment } from "../date-field/date-field-segment.ts";
import { DateRangeFieldInput } from "../date-range-field/date-range-field-input.ts";
import { DateRangePickerInputRoot } from "./date-range-picker-input-root.ts";

/**
 * spec/calendar.md, "Typed input": a DateRangePicker typed into two ends' segments; its other
 * parts are the DateRangePicker's
 */
export const DateRangePickerInput = {
    Root: DateRangePickerInputRoot,
    Segments: DateRangeFieldInput,
    Segment: DateFieldSegment,
};
