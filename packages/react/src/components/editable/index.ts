// The entry of @fragiola/primitives-react/editable: a text edited in place (spec/editable.md, Zag's
// and Reka UI's inline edit): its activations, its commit and revert, its focus return. Its Input
// is the form control; it is a Field control.

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export type { EditableAreaProps } from "./editable-area.tsx";
export type { EditableCancelTriggerProps } from "./editable-cancel-trigger.tsx";
export type {
    EditableActivationMode,
    EditableState,
    EditableSubmitMode,
} from "./editable-context.ts";
export type { EditableEditTriggerProps } from "./editable-edit-trigger.tsx";
export type { EditableInputProps } from "./editable-input.tsx";
export type { EditablePreviewProps } from "./editable-preview.tsx";
export type { EditableRootProps } from "./editable-root.tsx";
export type { EditableSubmitTriggerProps } from "./editable-submit-trigger.tsx";
export { Editable } from "./parts.ts";
