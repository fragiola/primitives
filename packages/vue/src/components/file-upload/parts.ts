import { FileUploadClearTrigger } from "./file-upload-clear-trigger.ts";
import { FileUploadDropzone } from "./file-upload-dropzone.ts";
import { FileUploadHiddenInput } from "./file-upload-hidden-input.ts";
import { FileUploadItem } from "./file-upload-item.ts";
import { FileUploadItemDeleteTrigger } from "./file-upload-item-delete-trigger.ts";
import { FileUploadItemGroup } from "./file-upload-item-group.ts";
import { FileUploadItemName } from "./file-upload-item-name.ts";
import { FileUploadItemPreview } from "./file-upload-item-preview.ts";
import { FileUploadItemPreviewImage } from "./file-upload-item-preview-image.ts";
import { FileUploadItemSizeText } from "./file-upload-item-size-text.ts";
import { FileUploadLabel } from "./file-upload-label.ts";
import { FileUploadRoot } from "./file-upload-root.ts";
import { FileUploadTrigger } from "./file-upload-trigger.ts";

/** spec/file-upload.md */
export const FileUpload = {
    Root: FileUploadRoot,
    Label: FileUploadLabel,
    Dropzone: FileUploadDropzone,
    Trigger: FileUploadTrigger,
    HiddenInput: FileUploadHiddenInput,
    ItemGroup: FileUploadItemGroup,
    Item: FileUploadItem,
    ItemName: FileUploadItemName,
    ItemSizeText: FileUploadItemSizeText,
    ItemPreview: FileUploadItemPreview,
    ItemPreviewImage: FileUploadItemPreviewImage,
    ItemDeleteTrigger: FileUploadItemDeleteTrigger,
    ClearTrigger: FileUploadClearTrigger,
};
