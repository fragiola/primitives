// The entry of @fragiola/primitives-angular/checkbox: a two-state or mixed choice, with form
// support (spec/checkbox.md, the APG's checkbox), as standalone attribute directives on the
// consumer's own elements.

export type {
    ChangeDetails,
    ChangeReason,
} from "@fragiola/primitives-angular/internal";
export { CheckboxIndicator } from "./directives/checkbox-indicator.directive.ts";
export {
    CheckboxRoot,
    type CheckboxState,
} from "./directives/checkbox-root.directive.ts";
