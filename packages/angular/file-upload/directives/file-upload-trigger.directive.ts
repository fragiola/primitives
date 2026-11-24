import { Directive } from "@angular/core";
import {
    injectEnclosing,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { ROOT_DATA_HOST } from "../utils/root-data-host.ts";
import { FileUploadRoot } from "./file-upload-root.directive.ts";

/** The button that opens the file dialog (spec/file-upload.md): `<button fileUploadTrigger>`. */
@Directive({
    selector: "button[fileUploadTrigger]",
    exportAs: "fileUploadTrigger",
    host: {
        type: "button",
        "data-primitives-part": "file-upload-trigger",
        "[disabled]": "root.isDisabled()",
        ...ROOT_DATA_HOST,
        "(click)": "root.openDialog()",
    },
})
export class FileUploadTrigger {
    protected readonly root = injectEnclosing(
        FileUploadRoot,
        "fileUploadRoot",
        "fileUploadTrigger",
    );
    readonly state = this.root.state;

    constructor() {
        registerHost(this.root.trigger);
    }
}
