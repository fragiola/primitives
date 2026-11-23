import {
    EditableArea,
    EditableCancelTrigger,
    EditableEditTrigger,
    EditableInput,
    EditablePreview,
    EditableRoot,
    EditableSubmitTrigger,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/editable";
import { editable } from "examples-shared/recipes/editable";

/** Every Editable directive, for a scenario's `imports`. */
export const EDITABLE_PARTS = [
    EditableRoot,
    EditableArea,
    EditablePreview,
    EditableInput,
    EditableEditTrigger,
    EditableSubmitTrigger,
    EditableCancelTrigger,
] as const;

function icon(d: string): string {
    return `<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="${d}" /></svg>`;
}

/** The Area with its Preview and Input (a `textarea` with `textarea`), styled as React's kit. */
export function area(textarea = false): string {
    return `<div editableArea class="${editable.area}"><span editablePreview class="${editable.preview}"></span>${textarea ? `<textarea editableInput class="${editable.input}"></textarea>` : `<input editableInput class="${editable.input}" />`}</div>`;
}

/** The styled triggers, each with its icon (a pencil, a check, a cross): React's kit. */
export function editTrigger(label: string): string {
    return `<button editableEditTrigger aria-label="${label}" class="${editable["edit-trigger"]}">${icon("M4 20h4L19 9l-4-4L4 16v4z")}</button>`;
}

export function submitTrigger(label: string): string {
    return `<button editableSubmitTrigger aria-label="${label}" class="${editable["submit-trigger"]}">${icon("M5 12l5 5L20 7")}</button>`;
}

export function cancelTrigger(label: string): string {
    return `<button editableCancelTrigger aria-label="${label}" class="${editable["cancel-trigger"]}">${icon("M6 6l12 12M18 6L6 18")}</button>`;
}

/** A value as the fixtures print it: a line break as `\n` (spec/editable.md, "Scenarios"). */
export function printText(value: string): string {
    return value.replaceAll("\n", "\\n");
}

/** A commit or a revert as the fixtures print it: `<value> (<reason>)`. */
export function printEnd(event: ValueChangeEvent<string>): string {
    return `${printText(event.value)} (${event.details.reason})`;
}
