import type { MouseEvent } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    FileUploadContext,
    type FileUploadState,
    fileUploadState,
} from "./file-upload-context.ts";

export type FileUploadClearTriggerProps = PartProps<FileUploadState>;

/** Removes every file; hidden while there is none (spec/file-upload.md). */
export function FileUploadClearTrigger(props: FileUploadClearTriggerProps) {
    const context = useRequiredContext(
        FileUploadContext,
        "FileUpload.ClearTrigger",
    );
    return renderElement("button", props, fileUploadState(context), {
        type: "button",
        disabled: context.disabled,
        hidden: context.empty && context.rejectedFiles.length === 0,
        "data-primitives-part": "file-upload-clear-trigger",
        ...context.attributes,
        onClick: (event: MouseEvent<HTMLElement>) =>
            context.clear(event.nativeEvent),
    });
}
