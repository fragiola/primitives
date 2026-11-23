// The entry of @fragiola/primitives-angular/password-input: a password field whose text a toggle
// button shows and hides (spec/password-input.md), as standalone directives on the consumer's own
// elements. Its Input is the form control; it is a Field control.

export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { PasswordInputInput } from "./directives/password-input-input.directive.ts";
export {
    PasswordInputRoot,
    type PasswordInputState,
    type PasswordInputVisibleChangeEvent,
} from "./directives/password-input-root.directive.ts";
export { PasswordInputVisibilityTrigger } from "./directives/password-input-visibility-trigger.directive.ts";
