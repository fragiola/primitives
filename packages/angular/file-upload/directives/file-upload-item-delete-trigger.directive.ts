import { Directive } from "@angular/core";
import {
    injectEnclosing,
    injectHost,
} from "@fragiola/primitives-angular/internal";
import { ITEM_DATA_HOST } from "../utils/item-data-host.ts";
import { FileUploadItem } from "./file-upload-item.directive.ts";

/**
 * Removes the Item's file, moving the focus on (spec/file-upload.md, "Focus"):
 * `<button fileUploadItemDeleteTrigger aria-label="Remove photo.png">`.
 */
@Directive({
    selector: "button[fileUploadItemDeleteTrigger]",
    exportAs: "fileUploadItemDeleteTrigger",
    host: {
        type: "button",
        "data-primitives-part": "file-upload-item-delete-trigger",
        "[disabled]": "item.root.isDisabled()",
        ...ITEM_DATA_HOST,
        "(click)": "remove($event)",
    },
})
export class FileUploadItemDeleteTrigger {
    protected readonly item = injectEnclosing(
        FileUploadItem,
        "fileUploadItem",
        "fileUploadItemDeleteTrigger",
    );
    readonly state = this.item.state;
    private readonly host = injectHost();

    protected remove(event: Event): void {
        this.item.root.remove(this.item.file(), event, this.host);
    }
}
