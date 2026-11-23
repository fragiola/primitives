import {
    DateFieldSegment,
    DateRangeFieldInput,
    DateRangeFieldRoot,
} from "@fragiola/primitives-angular/date-range-field";
import { TimeRangeFieldRoot } from "@fragiola/primitives-angular/time-range-field";

/** Every DateRangeField and TimeRangeField directive, for a scenario's `imports`. */
export const RANGE_FIELD_PARTS = [
    DateRangeFieldRoot,
    TimeRangeFieldRoot,
    DateRangeFieldInput,
    DateFieldSegment,
] as const;
