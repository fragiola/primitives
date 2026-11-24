import { Directive } from "@angular/core";
import { injectEnclosing } from "@fragiola/primitives-angular/internal";
import { ROOT_DATA_HOST } from "../utils/root-data-host.ts";
import { FileUploadRoot } from "./file-upload-root.directive.ts";

/** Removes every file; hidden while there is none (spec/file-upload.md): `<button fileUploadClearTrigger>`. */
@Directive({
    selector: "button[fileUploadClearTrigger]",
    exportAs: "fileUploadClearTrigger",
    host: {
        type: "button",
        "data-primitives-part": "file-upload-clear-trigger",
        "[disabled]": "root.isDisabled()",
        "[attr.hidden]":
            'root.state().empty && root.state().rejectedFiles.length === 0 ? "" : null',
        ...ROOT_DATA_HOST,
        "(click)": "root.clear($event)",
    },
})
export class FileUploadClearTrigger {
    protected readonly root = injectEnclosing(
        FileUploadRoot,
        "fileUploadRoot",
        "fileUploadClearTrigger",
    );
    readonly state = this.root.state;
}
