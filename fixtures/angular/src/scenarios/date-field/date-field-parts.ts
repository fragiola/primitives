import {
    DateFieldInput,
    DateFieldRoot,
    DateFieldSegment,
} from "@fragiola/primitives-angular/date-field";
import { TimeFieldRoot } from "@fragiola/primitives-angular/time-field";

/** Every DateField and TimeField directive, for a scenario's `imports`. */
export const DATE_FIELD_PARTS = [
    DateFieldRoot,
    TimeFieldRoot,
    DateFieldInput,
    DateFieldSegment,
] as const;
