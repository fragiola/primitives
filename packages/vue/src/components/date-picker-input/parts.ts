import { DateFieldInput } from "../date-field/date-field-input.ts";
import { DateFieldSegment } from "../date-field/date-field-segment.ts";
import { DatePickerInputRoot } from "./date-picker-input-root.ts";

/**
 * spec/calendar.md, "Typed input": a DatePicker typed into DateField segments; its other parts
 * are the DatePicker's
 */
export const DatePickerInput = {
    Root: DatePickerInputRoot,
    Segments: DateFieldInput,
    Segment: DateFieldSegment,
};
