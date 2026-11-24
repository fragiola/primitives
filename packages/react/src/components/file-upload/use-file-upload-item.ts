import { useRequiredContext } from "../../hooks/use-required-context.ts";
import {
    FileUploadContext,
    type FileUploadContextValue,
    FileUploadItemContext,
    type FileUploadItemContextValue,
    type FileUploadItemState,
    fileUploadState,
} from "./file-upload-context.ts";

/** An Item part's contexts and state. */
export function useFileUploadItem(part: string): {
    root: FileUploadContextValue;
    item: FileUploadItemContextValue;
    state: FileUploadItemState;
} {
    const root = useRequiredContext(FileUploadContext, part);
    const item = useRequiredContext(FileUploadItemContext, part);
    return {
        root,
        item,
        state: {
            ...fileUploadState(root),
            file: item.file,
            rejected: item.rejected,
            reasons: item.reasons,
        },
    };
}
