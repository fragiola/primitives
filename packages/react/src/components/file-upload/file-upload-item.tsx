import { useMemo } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    FileUploadContext,
    FileUploadItemContext,
    type FileUploadItemContextValue,
    type FileUploadItemState,
    fileUploadState,
} from "./file-upload-context.ts";

export interface FileUploadItemProps extends PartProps<FileUploadItemState> {
    /** The Item's file: an accepted one, or a rejected one. */
    file: File;
}

const NO_REASONS: readonly string[] = [];

/** One file, accepted or rejected (spec/file-upload.md). */
export function FileUploadItem({ file, ...props }: FileUploadItemProps) {
    const context = useRequiredContext(FileUploadContext, "FileUpload.Item");
    const rejection = context.rejectedFiles.find(
        (entry) => entry.file === file,
    );
    const rejected = rejection !== undefined && !context.value.includes(file);
    const reasons = rejected ? rejection.reasons : NO_REASONS;
    const item = useMemo<FileUploadItemContextValue>(
        () => ({
            file,
            rejected,
            reasons,
            attributes: {
                ...context.attributes,
                ...stateAttributes({ rejected }),
            },
        }),
        [file, rejected, reasons, context.attributes],
    );
    return (
        <FileUploadItemContext.Provider value={item}>
            {renderElement(
                "li",
                props,
                { ...fileUploadState(context), file, rejected, reasons },
                {
                    "data-primitives-part": "file-upload-item",
                    ...item.attributes,
                },
            )}
        </FileUploadItemContext.Provider>
    );
}
