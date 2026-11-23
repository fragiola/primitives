// The entry of @fragiola/primitives-vue/editable: a text edited in place (spec/editable.md, Zag's
// and Reka UI's inline edit): its activations, its commit and revert, its focus return. Its Input
// is the form control; it is a Field control.

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type {
    EditableActivationMode,
    EditableState,
    EditableSubmitMode,
} from "./editable-context.ts";
export type {
    EditableRootEmits,
    EditableRootProps,
} from "./editable-root.ts";
export { Editable } from "./parts.ts";
