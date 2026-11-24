import type { FileRejection } from "@fragiola/primitives-angular/file-upload";
import {
    FileUploadClearTrigger,
    FileUploadDropzone,
    FileUploadHiddenInput,
    FileUploadItem,
    FileUploadItemDeleteTrigger,
    FileUploadItemGroup,
    FileUploadItemName,
    FileUploadItemPreview,
    FileUploadItemPreviewImage,
    FileUploadItemSizeText,
    FileUploadLabel,
    FileUploadRoot,
    FileUploadTrigger,
} from "@fragiola/primitives-angular/file-upload";

/** Every FileUpload directive, for a scenario's `imports`. */
export const FILE_UPLOAD_PARTS = [
    FileUploadRoot,
    FileUploadLabel,
    FileUploadDropzone,
    FileUploadTrigger,
    FileUploadHiddenInput,
    FileUploadItemGroup,
    FileUploadItem,
    FileUploadItemName,
    FileUploadItemSizeText,
    FileUploadItemPreview,
    FileUploadItemPreviewImage,
    FileUploadItemDeleteTrigger,
    FileUploadClearTrigger,
] as const;

/** The names of `files`, joined (`none` for none). */
export const fileNames = (files: readonly File[] | undefined) =>
    files === undefined || files.length === 0
        ? undefined
        : files.map((file) => file.name).join(", ");

/** Each rejection as `name (reasons)`, joined (`none` for none). */
export const rejections = (rejected: readonly FileRejection<File>[]) =>
    rejected.length === 0
        ? undefined
        : rejected
              .map(
                  (entry) => `${entry.file.name} (${entry.reasons.join(", ")})`,
              )
              .join("; ");
