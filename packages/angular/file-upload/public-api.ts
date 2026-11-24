// The entry of @fragiola/primitives-angular/file-upload: a form control holding a list of files,
// their checks, Items, previews and the native form through the hidden file input
// (spec/file-upload.md), as standalone directives on the consumer's own elements. Its checks,
// sizes and drop target are the toolkit's `/file`.

export type {
    CheckedFile,
    FileAccept,
    FileRejection,
    FileRejectionReason,
} from "@fragiola/primitives/file";
export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { FileUploadClearTrigger } from "./directives/file-upload-clear-trigger.directive.ts";
export { FileUploadDropzone } from "./directives/file-upload-dropzone.directive.ts";
export { FileUploadHiddenInput } from "./directives/file-upload-hidden-input.directive.ts";
export {
    FileUploadItem,
    type FileUploadItemState,
} from "./directives/file-upload-item.directive.ts";
export { FileUploadItemDeleteTrigger } from "./directives/file-upload-item-delete-trigger.directive.ts";
export { FileUploadItemGroup } from "./directives/file-upload-item-group.directive.ts";
export { FileUploadItemName } from "./directives/file-upload-item-name.directive.ts";
export { FileUploadItemPreview } from "./directives/file-upload-item-preview.directive.ts";
export { FileUploadItemPreviewImage } from "./directives/file-upload-item-preview-image.directive.ts";
export { FileUploadItemSizeText } from "./directives/file-upload-item-size-text.directive.ts";
export { FileUploadLabel } from "./directives/file-upload-label.directive.ts";
export {
    type FileUploadPickDetails,
    FileUploadRoot,
    type FileUploadState,
} from "./directives/file-upload-root.directive.ts";
export { FileUploadTrigger } from "./directives/file-upload-trigger.directive.ts";
export { injectFileUpload } from "./inject/inject-file-upload.ts";
