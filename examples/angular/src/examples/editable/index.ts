import { Component, signal } from "@angular/core";
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
import { styles } from "./styles.ts";

// An inline-editable title (spec/editable.md): focusing the title or pressing the pencil turns it
// into a field with the text selected; Enter or the check saves it, Escape or the cross puts it
// back, and the focus returns to the pencil.
@Component({
    selector: "example-inline-editable-title",
    imports: [
        EditableRoot,
        EditableArea,
        EditablePreview,
        EditableInput,
        EditableEditTrigger,
        EditableSubmitTrigger,
        EditableCancelTrigger,
    ],
    template: `
        <div [class]="styles.stack">
            <label for="document-title" [class]="styles.label">Document title</label>
            <div editableRoot [id]="'document-title'" [defaultValue]="'Quarterly report'" [placeholder]="'Untitled document'" (valueCommit)="saved($event)" (valueRevert)="status.set('Edit cancelled.')" [class]="styles.root">
                <div editableArea [class]="styles.area">
                    <span editablePreview [class]="styles.preview"></span>
                    <input editableInput [class]="styles.input" />
                </div>
                <button editableEditTrigger aria-label="Rename" [class]="styles.editTrigger">
                    <svg [class]="styles.icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z" /></svg>
                </button>
                <button editableSubmitTrigger aria-label="Save" [class]="styles.submitTrigger">
                    <svg [class]="styles.icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
                </button>
                <button editableCancelTrigger aria-label="Cancel" [class]="styles.cancelTrigger">
                    <svg [class]="styles.icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
            </div>
            <p role="status" [class]="styles.status">{{ status() }}</p>
        </div>
    `,
})
export default class InlineEditableTitle {
    protected readonly styles = styles;
    protected readonly status = signal("");

    protected saved({ value }: ValueChangeEvent<string>): void {
        this.status.set(`Saved “${value}”.`);
    }
}
