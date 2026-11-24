import { computed, Directive } from "@angular/core";
import { formatFileSize } from "@fragiola/primitives/file";
import { injectEnclosing } from "@fragiola/primitives-angular/internal";
import { ITEM_DATA_HOST } from "../utils/item-data-host.ts";
import { FileUploadItem } from "./file-upload-item.directive.ts";

/**
 * The Item's file size in the locale's bytes, written by the directive (spec/file-upload.md):
 * `<span fileUploadItemSizeText>`.
 */
@Directive({
    selector: "[fileUploadItemSizeText]",
    exportAs: "fileUploadItemSizeText",
    host: {
        "data-primitives-part": "file-upload-item-size-text",
        ...ITEM_DATA_HOST,
        "[textContent]": "text()",
    },
})
export class FileUploadItemSizeText {
    protected readonly item = injectEnclosing(
        FileUploadItem,
        "fileUploadItem",
        "fileUploadItemSizeText",
    );
    readonly state = this.item.state;
    protected readonly text = computed(() =>
        formatFileSize(this.item.file().size, this.item.root.locale()),
    );
}
