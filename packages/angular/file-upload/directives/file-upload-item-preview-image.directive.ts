import { afterRenderEffect, Directive } from "@angular/core";
import {
    injectEnclosing,
    injectHost,
} from "@fragiola/primitives-angular/internal";
import { ITEM_DATA_HOST } from "../utils/item-data-host.ts";
import { FileUploadItem } from "./file-upload-item.directive.ts";

/**
 * The Item's file as an image (spec/file-upload.md): `<img fileUploadItemPreviewImage alt="" />`,
 * its `src` an object URL made once it is in the page (none on a server) and revoked when it is
 * destroyed or its file changes; `alt` is the app's.
 */
@Directive({
    selector: "img[fileUploadItemPreviewImage]",
    exportAs: "fileUploadItemPreviewImage",
    host: {
        "data-primitives-part": "file-upload-item-preview-image",
        ...ITEM_DATA_HOST,
    },
})
export class FileUploadItemPreviewImage {
    protected readonly item = injectEnclosing(
        FileUploadItem,
        "fileUploadItem",
        "fileUploadItemPreviewImage",
    );
    readonly state = this.item.state;

    constructor() {
        const host = injectHost<HTMLImageElement>();
        afterRenderEffect({
            write: (onCleanup) => {
                const file = this.item.file();
                const url = host.ownerDocument.defaultView?.URL;
                if (url === undefined) {
                    return;
                }
                const objectUrl = url.createObjectURL(file);
                host.setAttribute("src", objectUrl);
                onCleanup(() => url.revokeObjectURL(objectUrl));
            },
        });
    }
}
