// The entry of @fragiola/primitives-angular/number-field: a number's text field, its buttons and its
// scrub area (spec/number-field.md, the APG spinbutton), as standalone directives on the
// consumer's own elements. Its parsing, formatting, stepping, auto repeat and scrub are the
// toolkit's `/number`; it is a Field control.

export type { ScrubPoint } from "@fragiola/primitives/number";
export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { NumberFieldDecrement } from "./directives/number-field-decrement.directive.ts";
export { NumberFieldGroup } from "./directives/number-field-group.directive.ts";
export { NumberFieldIncrement } from "./directives/number-field-increment.directive.ts";
export { NumberFieldInput } from "./directives/number-field-input.directive.ts";
export {
    NumberFieldRoot,
    type NumberFieldState,
} from "./directives/number-field-root.directive.ts";
export { NumberFieldScrubArea } from "./directives/number-field-scrub-area.directive.ts";
export { NumberFieldScrubAreaCursor } from "./directives/number-field-scrub-area-cursor.directive.ts";
