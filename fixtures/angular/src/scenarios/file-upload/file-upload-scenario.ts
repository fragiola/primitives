import { Directive, signal } from "@angular/core";
import type {
    FileRejection,
    FileUploadPickDetails,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/file-upload";
import { fileUpload } from "examples-shared/recipes/file-upload";
import { fileNames, rejections } from "./file-upload-parts.ts";

/**
 * The attachments uploader of `/file-upload/basic` and `/file-upload/disabled`
 * (spec/file-upload.md); its output inside the Root, which holds the rejected list.
 */
export function fileUploadTemplate(bindings: string): string {
    return `
        <div fileUploadRoot #upload="fileUploadRoot" ${bindings} [maxFiles]="3" [accept]="'image/*,.pdf'" [maxFileSize]="1000000" [minFileSize]="1" [validate]="validate" [locale]="'en-US'" [value]="value()" (valueChangeDetails)="changed($event)" (fileReject)="reason.set($event.details.reason)" [announcement]="announce" class="${fileUpload.root}">
            <label fileUploadLabel class="${fileUpload.label}">Attachments</label>
            <div fileUploadDropzone class="${fileUpload.dropzone}">Drop files here</div>
            <div class="flex items-center gap-2">
                <button fileUploadTrigger class="${fileUpload.trigger}">Choose files</button>
                <button fileUploadClearTrigger class="${fileUpload["clear-trigger"]}">Clear all</button>
            </div>
            <input fileUploadHiddenInput />
            <ul fileUploadItemGroup data-testid="accepted" class="${fileUpload["item-group"]}">
                @for (file of upload.state().value; track file.name) {
                    <li fileUploadItem [file]="file" class="${fileUpload.item}">
                        <div *fileUploadItemPreview class="${fileUpload["item-preview"]}"><img fileUploadItemPreviewImage alt="" class="${fileUpload["item-preview-image"]}" /></div>
                        <div class="flex min-w-0 flex-1 flex-col">
                            <span fileUploadItemName class="${fileUpload["item-name"]}"></span>
                            <span fileUploadItemSizeText class="${fileUpload["item-size-text"]}"></span>
                        </div>
                        <button fileUploadItemDeleteTrigger [attr.aria-label]="'Remove ' + file.name" class="${fileUpload["item-delete-trigger"]}">×</button>
                    </li>
                }
            </ul>
            <ul fileUploadItemGroup data-testid="rejected" class="${fileUpload["item-group"]}">
                @for (entry of upload.state().rejectedFiles; track entry.file.name) {
                    <li fileUploadItem [file]="entry.file" class="${fileUpload.item}">
                        <div class="flex min-w-0 flex-1 flex-col">
                            <span fileUploadItemName class="${fileUpload["item-name"]}"></span>
                            <span class="text-xs">{{ entry.reasons.join(", ") }}</span>
                        </div>
                        <button fileUploadItemDeleteTrigger [attr.aria-label]="'Dismiss ' + entry.file.name" class="${fileUpload["item-delete-trigger"]}">×</button>
                    </li>
                }
            </ul>
            <pre fixtureOutput [values]="{ value: fileNames(upload.state().value), rejected: rejections(upload.state().rejectedFiles), reason: reason() }"></pre>
        </div>
    `;
}

/** The scenarios' state. */
@Directive()
export abstract class FileUploadScenario {
    protected readonly value = signal<File[]>([]);
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly fileNames = fileNames;
    protected readonly rejections = (
        rejected: readonly FileRejection<File>[],
    ) => rejections(rejected);
    protected readonly validate = (file: File) =>
        file.name.includes(" ") ? ["name-has-spaces"] : null;
    protected readonly announce = (details: FileUploadPickDetails) =>
        `${details.value.length} files, ${details.rejectedFiles.length} rejected`;

    protected changed(event: ValueChangeEvent<File[]>): void {
        this.value.set(event.value);
        this.reason.set(event.details.reason);
    }
}
