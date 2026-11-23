import { EditableArea } from "./editable-area.ts";
import { EditableCancelTrigger } from "./editable-cancel-trigger.ts";
import { EditableEditTrigger } from "./editable-edit-trigger.ts";
import { EditableInput } from "./editable-input.ts";
import { EditablePreview } from "./editable-preview.ts";
import { EditableRoot } from "./editable-root.ts";
import { EditableSubmitTrigger } from "./editable-submit-trigger.ts";

/** spec/editable.md */
export const Editable = {
    Root: EditableRoot,
    Area: EditableArea,
    Preview: EditablePreview,
    Input: EditableInput,
    EditTrigger: EditableEditTrigger,
    SubmitTrigger: EditableSubmitTrigger,
    CancelTrigger: EditableCancelTrigger,
};
