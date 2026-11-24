import { acceptsFile } from "@fragiola/primitives/file";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import type { FileUploadItemState } from "./file-upload-context.ts";
import { useFileUploadItem } from "./use-file-upload-item.ts";

export interface FileUploadItemPreviewProps
    extends PartProps<FileUploadItemState> {
    /** The files it previews, an `accept` pattern (default `"image/*"`). */
    type?: string;
}

/** A preview, rendered only for a file of its type (spec/file-upload.md). */
export function FileUploadItemPreview({
    type = "image/*",
    ...props
}: FileUploadItemPreviewProps) {
    const { item, state } = useFileUploadItem("FileUpload.ItemPreview");
    if (!acceptsFile(item.file, type)) {
        return null;
    }
    return renderElement("div", props, state, {
        "data-primitives-part": "file-upload-item-preview",
        ...item.attributes,
    });
}
