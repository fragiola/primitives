import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import type { FileUploadItemState } from "./file-upload-context.ts";
import { useFileUploadItem } from "./use-file-upload-item.ts";

export type FileUploadItemNameProps = PartProps<FileUploadItemState>;

/** The Item's file name, unless the app gives children (spec/file-upload.md). */
export function FileUploadItemName(props: FileUploadItemNameProps) {
    const { item, state } = useFileUploadItem("FileUpload.ItemName");
    return renderElement(
        "span",
        { ...props, children: props.children ?? item.file.name },
        state,
        {
            "data-primitives-part": "file-upload-item-name",
            ...item.attributes,
        },
    );
}
