import { NumberFieldDecrement } from "./number-field-decrement.tsx";
import { NumberFieldGroup } from "./number-field-group.tsx";
import { NumberFieldIncrement } from "./number-field-increment.tsx";
import { NumberFieldInput } from "./number-field-input.tsx";
import { NumberFieldRoot } from "./number-field-root.tsx";
import { NumberFieldScrubArea } from "./number-field-scrub-area.tsx";
import { NumberFieldScrubAreaCursor } from "./number-field-scrub-area-cursor.tsx";

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
