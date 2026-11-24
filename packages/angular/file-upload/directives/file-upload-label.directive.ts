import { DestroyRef, Directive, inject } from "@angular/core";
import { injectEnclosing } from "@fragiola/primitives-angular/internal";
import { ROOT_DATA_HOST } from "../utils/root-data-host.ts";
import { FileUploadRoot } from "./file-upload-root.directive.ts";

/** The label of the HiddenInput (a press opens the dialog), naming the Root (spec/file-upload.md). */
@Directive({
    selector: "label[fileUploadLabel]",
    exportAs: "fileUploadLabel",
    host: {
        "data-primitives-part": "file-upload-label",
        "[id]": "root.labelId",
        "[attr.for]": "root.inputId()",
        ...ROOT_DATA_HOST,
    },
})
export class FileUploadLabel {
    protected readonly root = injectEnclosing(
        FileUploadRoot,
        "fileUploadRoot",
        "fileUploadLabel",
    );
    readonly state = this.root.state;

    constructor() {
        this.root.setLabelled(true);
        inject(DestroyRef).onDestroy(() => this.root.setLabelled(false));
    }
}
