import { computed, Directive } from "@angular/core";
import { injectEnclosing } from "@fragiola/primitives-angular/internal";
import { ITEM_DATA_HOST } from "../utils/item-data-host.ts";
import { FileUploadItem } from "./file-upload-item.directive.ts";

/** The Item's file name, written by the directive (spec/file-upload.md): `<span fileUploadItemName>`. */
@Directive({
    selector: "[fileUploadItemName]",
    exportAs: "fileUploadItemName",
    host: {
        "data-primitives-part": "file-upload-item-name",
        ...ITEM_DATA_HOST,
        "[textContent]": "text()",
    },
})
export class FileUploadItemName {
    protected readonly item = injectEnclosing(
        FileUploadItem,
        "fileUploadItem",
        "fileUploadItemName",
    );
    readonly state = this.item.state;
    protected readonly text = computed(() => this.item.file().name);
}
