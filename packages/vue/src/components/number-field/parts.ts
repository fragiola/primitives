import { NumberFieldDecrement } from "./number-field-decrement.ts";
import { NumberFieldGroup } from "./number-field-group.ts";
import { NumberFieldIncrement } from "./number-field-increment.ts";
import { NumberFieldInput } from "./number-field-input.ts";
import { NumberFieldRoot } from "./number-field-root.ts";
import { NumberFieldScrubArea } from "./number-field-scrub-area.ts";
import { NumberFieldScrubAreaCursor } from "./number-field-scrub-area-cursor.ts";

/** spec/number-field.md */
export const NumberField = {
    Root: NumberFieldRoot,
    Group: NumberFieldGroup,
    Input: NumberFieldInput,
    Increment: NumberFieldIncrement,
    Decrement: NumberFieldDecrement,
    ScrubArea: NumberFieldScrubArea,
    ScrubAreaCursor: NumberFieldScrubAreaCursor,
};
