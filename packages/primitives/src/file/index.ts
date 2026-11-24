// The entry of @fragiola/primitives/file: a drop target for files (drag, drop, paste and press),
// the browser's file dialog, `accept` matching, a FileUpload's checks and their reasons, a file
// size in the locale's bytes and the files assigned to a file input (spec/drop-zone.md,
// spec/file-upload.md).

export {
    acceptAttribute,
    acceptFiles,
    acceptsFile,
    type FileAccept,
    type FileLike,
} from "./accept-files.ts";
export { assignFiles } from "./assign-files.ts";
export {
    type CheckedFile,
    checkFiles,
    type FileCheck,
    type FileRejection,
    type FileRejectionReason,
    type FileRules,
} from "./check-files.ts";
export { fieldFiles } from "./field-files.ts";
export { formatFileSize } from "./format-file-size.ts";
export { type FileDialogOptions, openFileDialog } from "./open-file-dialog.ts";
export {
    dragHasFiles,
    type FileDropOptions,
    type FileDropReason,
    watchFileDrop,
} from "./watch-file-drop.ts";
