import { computed, Directive, effect, input } from "@angular/core";
import { acceptsFile } from "@fragiola/primitives/file";
import {
    conditionalView,
    injectEnclosing,
    writeAttributes,
} from "@fragiola/primitives-angular/internal";
import { FileUploadItem } from "./file-upload-item.directive.ts";

/**
 * A preview, rendered only for a file of its type (spec/file-upload.md): structural,
 * `<div *fileUploadItemPreview><img fileUploadItemPreviewImage alt="" /></div>`, or
 * `*fileUploadItemPreview="'video/*'"` (an `accept` pattern; default `"image/*"`).
 */
@Directive({
    selector: "[fileUploadItemPreview]",
    exportAs: "fileUploadItemPreview",
})
export class FileUploadItemPreview {
    private readonly item = injectEnclosing(
        FileUploadItem,
        "fileUploadItem",
        "fileUploadItemPreview",
    );
    /** The files it previews, an `accept` pattern (default `"image/*"`). */
    readonly type = input<string | undefined, string | undefined>("image/*", {
        alias: "fileUploadItemPreview",
        transform: (value) =>
            value === undefined || value === "" ? "image/*" : value,
    });
    private readonly shown = computed(() =>
        acceptsFile(this.item.file(), this.type() ?? "image/*"),
    );
    private readonly element = conditionalView(this.shown);
    readonly state = this.item.state;

    constructor() {
        effect(() => {
            const element = this.element();
            if (element === null) {
                return;
            }
            const data = this.item.data();
            writeAttributes(element, {
                "data-primitives-part": "file-upload-item-preview",
                ...Object.fromEntries(
                    Object.entries(data).map(([key, value]) => [
                        `data-${key === "dropTarget" ? "drop-target" : key}`,
                        value,
                    ]),
                ),
            });
        });
    }
}
