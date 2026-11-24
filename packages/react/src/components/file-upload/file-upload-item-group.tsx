import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    FileUploadContext,
    type FileUploadState,
    fileUploadState,
} from "./file-upload-context.ts";

export type FileUploadItemGroupProps = PartProps<FileUploadState>;

/** The list of Items (spec/file-upload.md). */
export function FileUploadItemGroup(props: FileUploadItemGroupProps) {
    const context = useRequiredContext(
        FileUploadContext,
        "FileUpload.ItemGroup",
    );
    return renderElement("ul", props, fileUploadState(context), {
        "data-primitives-part": "file-upload-item-group",
        ...context.attributes,
    });
}
