import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { FileRejection } from "@fragiola/primitives-angular/file-upload";
import { fileUpload } from "examples-shared/recipes/file-upload";
import { Output } from "../../kit/output.ts";
import {
    FILE_UPLOAD_PARTS,
    fileNames,
    rejections,
} from "./file-upload-parts.ts";

/** An avatar uploader (spec/file-upload.md, `/file-upload/single`). */
@Component({
    selector: "[scenario-file-upload-single]",
    encapsulation: ViewEncapsulation.None,
    imports: [FILE_UPLOAD_PARTS, Output],
    template: `
        <div fileUploadRoot #upload="fileUploadRoot" [accept]="'image/*'" (valueChangeDetails)="reason.set($event.details.reason); changes.set(changes() + 1)" (fileReject)="reason.set($event.details.reason)" class="${fileUpload.root}">
            <label fileUploadLabel class="${fileUpload.label}">Avatar</label>
            <div fileUploadDropzone class="${fileUpload.dropzone}">Drop an image</div>
            <div class="flex items-center gap-2">
                <button fileUploadTrigger class="${fileUpload.trigger}">Choose image</button>
            </div>
            <input fileUploadHiddenInput />
            <ul fileUploadItemGroup class="${fileUpload["item-group"]}">
                @for (file of upload.state().value; track file.name) {
                    <li fileUploadItem [file]="file" class="${fileUpload.item}">
                        <div *fileUploadItemPreview class="${fileUpload["item-preview"]}"><img fileUploadItemPreviewImage alt="Avatar preview" class="${fileUpload["item-preview-image"]}" /></div>
                        <span fileUploadItemName class="${fileUpload["item-name"]}"></span>
                    </li>
                }
            </ul>
            <pre fixtureOutput [values]="{ value: fileNames(upload.state().value), rejected: rejections(upload.state().rejectedFiles), reason: reason(), changes: changes() }"></pre>
        </div>
    `,
})
export class FileUploadSingle {
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly changes = signal(0);
    protected readonly fileNames = fileNames;
    protected readonly rejections = (
        rejected: readonly FileRejection<File>[],
    ) => rejections(rejected);
}
