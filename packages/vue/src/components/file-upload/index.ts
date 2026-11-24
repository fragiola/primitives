// The entry of @fragiola/primitives-vue/file-upload: a form control holding a list of files,
// their checks, Items, previews and the native form through the hidden file input
// (spec/file-upload.md). Its checks, sizes and drop target are the toolkit's `/file`.

export type {
    CheckedFile,
    FileAccept,
    FileRejection,
    FileRejectionReason,
} from "@fragiola/primitives/file";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type {
    FileUploadItemState,
    FileUploadState,
} from "./file-upload-context.ts";
export type { FileUploadItemProps } from "./file-upload-item.ts";
export type { FileUploadItemPreviewProps } from "./file-upload-item-preview.ts";
export type {
    FileUploadPickDetails,
    FileUploadRootEmits,
    FileUploadRootProps,
    FileUploadRootSlots,
} from "./file-upload-root.ts";
export { FileUpload } from "./parts.ts";
