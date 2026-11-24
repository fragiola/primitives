import { Directive } from "@angular/core";
import { watchFileDrop } from "@fragiola/primitives/file";
import {
    dataValue,
    fileDropTarget,
    injectEnclosing,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { ROOT_DATA_HOST } from "../utils/root-data-host.ts";
import { FileUploadRoot } from "./file-upload-root.directive.ts";

/**
 * DropZone's drop target inside a FileUpload (spec/file-upload.md): `<div fileUploadDropzone>`.
 * Its drops and pastes are the Root's picks, its press opens the HiddenInput's dialog.
 */
@Directive({
    selector: "[fileUploadDropzone]",
    exportAs: "fileUploadDropzone",
    host: {
        role: "button",
        "data-primitives-part": "file-upload-dropzone",
        "[attr.tabindex]": "root.isDisabled() ? null : 0",
        "[attr.aria-disabled]": 'root.isDisabled() ? "true" : null',
        ...ROOT_DATA_HOST,
        "[attr.data-drop-target]": "dropTargetData()",
    },
})
export class FileUploadDropzone {
    protected readonly root = injectEnclosing(
        FileUploadRoot,
        "fileUploadRoot",
        "fileUploadDropzone",
    );
    readonly state = this.root.state;
    private readonly dropTarget = fileDropTarget(
        registerHost(this.root.dropzone),
        {
            watch: watchFileDrop,
            disabled: this.root.isDisabled,
            onFiles: (files, reason, event) =>
                this.root.pick(files, reason, event),
            onDropTargetChange: (active) => this.root.setDropTarget(active),
            onActivate: () => this.root.openDialog(),
        },
    );
    protected dropTargetData(): string | null {
        return dataValue(this.dropTarget());
    }
}
