import { Directive } from "@angular/core";
import { injectEnclosing } from "@fragiola/primitives-angular/internal";
import { ROOT_DATA_HOST } from "../utils/root-data-host.ts";
import { FileUploadRoot } from "./file-upload-root.directive.ts";

/** The list of Items (spec/file-upload.md): `<ul fileUploadItemGroup>`. */
@Directive({
    selector: "[fileUploadItemGroup]",
    exportAs: "fileUploadItemGroup",
    host: {
        "data-primitives-part": "file-upload-item-group",
        ...ROOT_DATA_HOST,
    },
})
export class FileUploadItemGroup {
    protected readonly root = injectEnclosing(
        FileUploadRoot,
        "fileUploadRoot",
        "fileUploadItemGroup",
    );
    readonly state = this.root.state;
}
