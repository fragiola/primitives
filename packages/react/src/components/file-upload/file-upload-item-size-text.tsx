import { formatFileSize } from "@fragiola/primitives/file";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import type { FileUploadItemState } from "./file-upload-context.ts";
import { useFileUploadItem } from "./use-file-upload-item.ts";

export type FileUploadItemSizeTextProps = PartProps<FileUploadItemState>;

/** The Item's file size in the locale's bytes, unless the app gives children (spec/file-upload.md). */
export function FileUploadItemSizeText(props: FileUploadItemSizeTextProps) {
    const { root, item, state } = useFileUploadItem("FileUpload.ItemSizeText");
    return renderElement(
        "span",
        {
            ...props,
            children:
                props.children ?? formatFileSize(item.file.size, root.locale),
        },
        state,
        {
            "data-primitives-part": "file-upload-item-size-text",
            ...item.attributes,
        },
    );
}
