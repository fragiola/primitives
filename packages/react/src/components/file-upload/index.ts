// The entry of @fragiola/primitives-react/file-upload: a form control holding a list of files,
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
export type { RenderProp } from "../../utils/render-element.tsx";
export type { FileUploadClearTriggerProps } from "./file-upload-clear-trigger.tsx";
export type {
    FileUploadItemState,
    FileUploadState,
} from "./file-upload-context.ts";
export type { FileUploadDropzoneProps } from "./file-upload-dropzone.tsx";
export type { FileUploadHiddenInputProps } from "./file-upload-hidden-input.tsx";
export type { FileUploadItemProps } from "./file-upload-item.tsx";
export type { FileUploadItemDeleteTriggerProps } from "./file-upload-item-delete-trigger.tsx";
export type { FileUploadItemGroupProps } from "./file-upload-item-group.tsx";
export type { FileUploadItemNameProps } from "./file-upload-item-name.tsx";
export type { FileUploadItemPreviewProps } from "./file-upload-item-preview.tsx";
export type { FileUploadItemPreviewImageProps } from "./file-upload-item-preview-image.tsx";
export type { FileUploadItemSizeTextProps } from "./file-upload-item-size-text.tsx";
export type { FileUploadLabelProps } from "./file-upload-label.tsx";
export type {
    FileUploadPickDetails,
    FileUploadRootProps,
} from "./file-upload-root.tsx";
export type { FileUploadTriggerProps } from "./file-upload-trigger.tsx";
export { FileUpload } from "./parts.ts";
