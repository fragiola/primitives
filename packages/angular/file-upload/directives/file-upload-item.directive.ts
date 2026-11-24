import { computed, Directive, input } from "@angular/core";
import {
    dataValue,
    injectEnclosing,
} from "@fragiola/primitives-angular/internal";
import {
    FileUploadRoot,
    type FileUploadState,
} from "./file-upload-root.directive.ts";

/** An Item's state: the Root's, and its file. */
export interface FileUploadItemState extends FileUploadState {
    file: File;
    rejected: boolean;
    /** A rejected file's reasons (`[]` for an accepted one). */
    reasons: readonly string[];
}

const NO_REASONS: readonly string[] = [];

/** One file, accepted or rejected (spec/file-upload.md): `<li fileUploadItem [file]="file">`. */
@Directive({
    selector: "[fileUploadItem]",
    exportAs: "fileUploadItem",
    host: {
        "data-primitives-part": "file-upload-item",
        "[attr.data-invalid]": "data().invalid",
        "[attr.data-valid]": "data().valid",
        "[attr.data-dirty]": "data().dirty",
        "[attr.data-touched]": "data().touched",
        "[attr.data-filled]": "data().filled",
        "[attr.data-focused]": "data().focused",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-empty]": "data().empty",
        "[attr.data-drop-target]": "data().dropTarget",
        "[attr.data-rejected]": "data().rejected",
    },
})
export class FileUploadItem {
    readonly root = injectEnclosing(
        FileUploadRoot,
        "fileUploadRoot",
        "fileUploadItem",
    );
    /** The Item's file: an accepted one, or a rejected one. */
    readonly file = input.required<File>();
    private readonly rejection = computed(() => {
        const file = this.file();
        const root = this.root.state();
        const found = root.rejectedFiles.find((entry) => entry.file === file);
        return found !== undefined && !root.value.includes(file) ? found : null;
    });
    readonly state = computed<FileUploadItemState>(() => {
        const rejection = this.rejection();
        return {
            ...this.root.state(),
            file: this.file(),
            rejected: rejection !== null,
            reasons: rejection?.reasons ?? NO_REASONS,
        };
    });
    /** The Root's state attributes and `data-rejected`, for the Item's parts. */
    readonly data = computed(() => ({
        ...this.root.data(),
        rejected: dataValue(this.rejection() !== null),
    }));
}
