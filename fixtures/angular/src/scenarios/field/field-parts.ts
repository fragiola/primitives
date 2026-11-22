import {
    FieldControl,
    FieldDescription,
    FieldError,
    FieldLabel,
    FieldRoot,
} from "@fragiola/primitives-angular/field";

/** Every Field directive, for a scenario's `imports`. */
export const FIELD_PARTS = [
    FieldRoot,
    FieldLabel,
    FieldControl,
    FieldDescription,
    FieldError,
] as const;
