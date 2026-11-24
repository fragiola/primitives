import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    FileUploadContext,
    type FileUploadState,
    fileUploadState,
} from "./file-upload-context.ts";

export type FileUploadTriggerProps = PartProps<FileUploadState>;

/** The button that opens the file dialog (spec/file-upload.md). */
export function FileUploadTrigger(props: FileUploadTriggerProps) {
    const context = useRequiredContext(FileUploadContext, "FileUpload.Trigger");
    return renderElement(
        "button",
        props,
        fileUploadState(context),
        {
            type: "button",
            disabled: context.disabled,
            "data-primitives-part": "file-upload-trigger",
            ...context.attributes,
            onClick: context.openDialog,
        },
        context.setTrigger,
    );
}
