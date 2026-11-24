import { Component, signal } from "@angular/core";
import {
    FieldDescription,
    FieldError,
    FieldLabel,
    FieldRoot,
} from "@fragiola/primitives-angular/field";
import {
    FileUploadClearTrigger,
    FileUploadDropzone,
    FileUploadHiddenInput,
    FileUploadItem,
    FileUploadItemDeleteTrigger,
    FileUploadItemGroup,
    FileUploadItemName,
    FileUploadItemSizeText,
    type FileUploadPickDetails,
    FileUploadRoot,
    FileUploadTrigger,
} from "@fragiola/primitives-angular/file-upload";
import { styles } from "./styles.ts";

const MESSAGES: Record<string, string> = {
    "invalid-type": "not an image or a PDF",
    "too-large": "over 5 MB",
    "too-many": "more than 4 files",
};

// A required Field of attachments: drop files on the zone, paste them on it or pick them in the
// dialog; each pick is checked by type, size and count, the accepted files list their name and
// size with a remove button, the rejected ones say why, and a polite region announces the pick.
// The form submits the files through the hidden file input (spec/file-upload.md).
@Component({
    selector: "example-attachments-field",
    imports: [
        FieldRoot,
        FieldLabel,
        FieldDescription,
        FieldError,
        FileUploadRoot,
        FileUploadDropzone,
        FileUploadTrigger,
        FileUploadClearTrigger,
        FileUploadHiddenInput,
        FileUploadItemGroup,
        FileUploadItem,
        FileUploadItemName,
        FileUploadItemSizeText,
        FileUploadItemDeleteTrigger,
    ],
    template: `
        <form (submit)="submit($event)" [class]="styles.form">
            <div fieldRoot [name]="'attachments'" [class]="styles.field.root">
                <label fieldLabel [class]="styles.field.label">Attachments</label>
                <div fileUploadRoot #upload="fileUploadRoot" [maxFiles]="4" [maxFileSize]="5000000" [accept]="'image/*,.pdf'" [required]="true" [announcement]="announce" [class]="styles.root">
                    <div fileUploadDropzone [class]="styles.dropzone">Drop images or PDFs here, or press to choose</div>
                    <div [class]="styles.actions">
                        <button fileUploadTrigger [class]="styles.trigger">Choose files</button>
                        <button fileUploadClearTrigger [class]="styles.clearTrigger">Clear all</button>
                    </div>
                    <input fileUploadHiddenInput />
                    <ul fileUploadItemGroup [class]="styles.itemGroup">
                        @for (file of upload.state().value; track file.name) {
                            <li fileUploadItem [file]="file" [class]="styles.item">
                                <div [class]="styles.itemText">
                                    <span fileUploadItemName [class]="styles.itemName"></span>
                                    <span fileUploadItemSizeText [class]="styles.itemSizeText"></span>
                                </div>
                                <button fileUploadItemDeleteTrigger [attr.aria-label]="'Remove ' + file.name" [class]="styles.itemDeleteTrigger">×</button>
                            </li>
                        }
                    </ul>
                    <ul fileUploadItemGroup [class]="styles.itemGroup">
                        @for (entry of upload.state().rejectedFiles; track entry.file.name) {
                            <li fileUploadItem [file]="entry.file" [class]="styles.item">
                                <div [class]="styles.itemText">
                                    <span fileUploadItemName [class]="styles.itemName"></span>
                                    <span [class]="styles.reasons">{{ explain(entry.reasons) }}</span>
                                </div>
                                <button fileUploadItemDeleteTrigger [attr.aria-label]="'Dismiss ' + entry.file.name" [class]="styles.itemDeleteTrigger">×</button>
                            </li>
                        }
                    </ul>
                </div>
                <p fieldDescription [class]="styles.field.description">Up to 4 images or PDFs, 5 MB each.</p>
                <div *fieldError="'valueMissing'" [class]="styles.field.error">Add at least one file.</div>
            </div>
            <button type="submit" [class]="styles.submit">Send</button>
            <p role="status" [class]="styles.status">{{ sent() === null ? "" : "Sent: " + sent() }}</p>
        </form>
    `,
})
export default class AttachmentsField {
    protected readonly styles = styles;
    protected readonly sent = signal<string | null>(null);
    protected readonly announce = (details: FileUploadPickDetails) =>
        `${details.value.length} attached, ${details.rejectedFiles.length} rejected`;

    protected explain(reasons: readonly string[]): string {
        return reasons.map((reason) => MESSAGES[reason] ?? reason).join(", ");
    }

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        const files = new FormData(event.target as HTMLFormElement)
            .getAll("attachments")
            .filter((entry): entry is File => entry instanceof File);
        this.sent.set(files.map((file) => file.name).join(", "));
    }
}
