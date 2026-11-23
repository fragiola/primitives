import { EditableArea } from "./editable-area.tsx";
import { EditableCancelTrigger } from "./editable-cancel-trigger.tsx";
import { EditableEditTrigger } from "./editable-edit-trigger.tsx";
import { EditableInput } from "./editable-input.tsx";
import { EditablePreview } from "./editable-preview.tsx";
import { EditableRoot } from "./editable-root.tsx";
import { EditableSubmitTrigger } from "./editable-submit-trigger.tsx";

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
