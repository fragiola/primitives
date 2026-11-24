import type { Signal } from "@angular/core";
import { injectEnclosing } from "@fragiola/primitives-angular/internal";
import {
    FileUploadRoot,
    type FileUploadState,
} from "../directives/file-upload-root.directive.ts";

/** The part hook of the enclosing `[fileUploadRoot]`: its state (the files and the rejected ones). */
export function injectFileUpload(): { state: Signal<FileUploadState> } {
    const root = injectEnclosing(
        FileUploadRoot,
        "fileUploadRoot",
        "injectFileUpload",
    );
    return { state: root.state };
}
