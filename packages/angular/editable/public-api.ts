// The entry of @fragiola/primitives-angular/editable: a text edited in place (spec/editable.md,
// Zag's and Reka UI's inline edit), as standalone directives on the consumer's own elements: its
// activations, its commit and revert, its focus return. Its Input is the form control; it is a
// Field control.

export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { EditableArea } from "./directives/editable-area.directive.ts";
export { EditableCancelTrigger } from "./directives/editable-cancel-trigger.directive.ts";
export { EditableEditTrigger } from "./directives/editable-edit-trigger.directive.ts";
export { EditableInput } from "./directives/editable-input.directive.ts";
export { EditablePreview } from "./directives/editable-preview.directive.ts";
export {
    type EditableActivationMode,
    EditableRoot,
    type EditableState,
    type EditableSubmitMode,
} from "./directives/editable-root.directive.ts";
export { EditableSubmitTrigger } from "./directives/editable-submit-trigger.directive.ts";
