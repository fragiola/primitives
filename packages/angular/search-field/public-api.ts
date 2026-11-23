// The entry of @fragiola/primitives-angular/search-field: a search query's field, cleared by
// Escape and a ClearButton (spec/search-field.md, React Aria's), as standalone directives on the
// consumer's own elements. Its Input is the form control; it is a Field control.

export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { SearchFieldClearButton } from "./directives/search-field-clear-button.directive.ts";
export { SearchFieldInput } from "./directives/search-field-input.directive.ts";
export {
    SearchFieldRoot,
    type SearchFieldState,
} from "./directives/search-field-root.directive.ts";
