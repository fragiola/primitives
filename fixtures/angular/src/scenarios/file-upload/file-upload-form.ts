import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/file-upload";
import { field } from "examples-shared/recipes/field";
import { fileUpload } from "examples-shared/recipes/file-upload";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";
import { FILE_UPLOAD_PARTS, fileNames } from "./file-upload-parts.ts";

/** A required FileUpload in a Field of a native form (spec/file-upload.md, `/file-upload/form`). */
@Component({
    selector: "[scenario-file-upload-form]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, FILE_UPLOAD_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-4" (submit)="submit($event)">
            <div fieldRoot [name]="'attachments'" class="${field.root}">
                <label fieldLabel class="${field.label}">Documents</label>
                <div fileUploadRoot #upload="fileUploadRoot" [maxFiles]="5" [required]="true" (valueChangeDetails)="changed($event)" class="${fileUpload.root}">
                    <div fileUploadDropzone class="${fileUpload.dropzone}">Drop documents</div>
                    <div class="flex items-center gap-2">
                        <button fileUploadTrigger class="${fileUpload.trigger}">Choose documents</button>
                    </div>
                    <input fileUploadHiddenInput />
                    <ul fileUploadItemGroup class="${fileUpload["item-group"]}">
                        @for (file of upload.state().value; track file.name) {
                            <li fileUploadItem [file]="file" class="${fileUpload.item}">
                                <span fileUploadItemName class="${fileUpload["item-name"]}"></span>
                                <button fileUploadItemDeleteTrigger [attr.aria-label]="'Remove ' + file.name" class="${fileUpload["item-delete-trigger"]}">×</button>
                            </li>
                        }
                    </ul>
                </div>
                <div *fieldError="'valueMissing'" class="${field.error}">Add at least one document</div>
            </div>
            <div class="flex gap-2">
                <button type="submit">Send</button>
                <button type="reset">Reset</button>
            </div>
        </form>
        <pre fixtureOutput [values]="{ submitted: submitted(), value: value(), reason: reason() }"></pre>
    `,
})
export class FileUploadForm {
    protected readonly submitted = signal<string | undefined>(undefined);
    protected readonly value = signal<string | undefined>(undefined);
    protected readonly reason = signal<string | undefined>(undefined);

    protected changed(event: ValueChangeEvent<File[]>): void {
        this.value.set(fileNames(event.value));
        this.reason.set(event.details.reason);
    }

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        const files = new FormData(event.currentTarget as HTMLFormElement)
            .getAll("attachments")
            .filter((entry): entry is File => entry instanceof File)
            .map((file) => `${file.name}:${file.size}`);
        this.submitted.set(files.length === 0 ? "none" : files.join(", "));
    }
}
