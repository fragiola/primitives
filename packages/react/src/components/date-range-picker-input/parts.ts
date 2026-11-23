import { DateFieldSegment } from "../date-field/date-field-segment.tsx";
import { DateRangeFieldInput } from "../date-range-field/date-range-field-input.tsx";
import { DateRangePickerInputRoot } from "./date-range-picker-input-root.tsx";

/**
 * spec/calendar.md, "Typed input": a DateRangePicker typed into two ends' segments; its other
 * parts are the DateRangePicker's
 */
export const DateRangePickerInput = {
    Root: DateRangePickerInputRoot,
    Segments: DateRangeFieldInput,
    Segment: DateFieldSegment,
};
