import { type ComputedRef, computed } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type FileUploadContext,
    type FileUploadItemContext,
    FileUploadItemKey,
    type FileUploadItemState,
    FileUploadKey,
} from "./file-upload-context.ts";

/** An Item part's contexts and state. */
export function useFileUploadItem(part: string): {
    root: FileUploadContext;
    item: FileUploadItemContext;
    state: ComputedRef<FileUploadItemState>;
} {
    const root = useRequiredContext(FileUploadKey, part);
    const item = useRequiredContext(FileUploadItemKey, part);
    const state = computed<FileUploadItemState>(() => ({
        ...root.state.value,
        file: item.file(),
        rejected: item.rejected.value,
        reasons: item.reasons.value,
    }));
    return { root, item, state };
}
