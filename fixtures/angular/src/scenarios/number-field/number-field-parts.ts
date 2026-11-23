import {
    NumberFieldDecrement,
    NumberFieldGroup,
    NumberFieldIncrement,
    NumberFieldInput,
    NumberFieldRoot,
    NumberFieldScrubArea,
    NumberFieldScrubAreaCursor,
} from "@fragiola/primitives-angular/number-field";

/** Every NumberField directive, for a scenario's `imports`. */
export const NUMBER_FIELD_PARTS = [
    NumberFieldRoot,
    NumberFieldGroup,
    NumberFieldInput,
    NumberFieldIncrement,
    NumberFieldDecrement,
    NumberFieldScrubArea,
    NumberFieldScrubAreaCursor,
] as const;
