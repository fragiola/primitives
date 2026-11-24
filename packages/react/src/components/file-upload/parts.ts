import { FileUploadClearTrigger } from "./file-upload-clear-trigger.tsx";
import { FileUploadDropzone } from "./file-upload-dropzone.tsx";
import { FileUploadHiddenInput } from "./file-upload-hidden-input.tsx";
import { FileUploadItem } from "./file-upload-item.tsx";
import { FileUploadItemDeleteTrigger } from "./file-upload-item-delete-trigger.tsx";
import { FileUploadItemGroup } from "./file-upload-item-group.tsx";
import { FileUploadItemName } from "./file-upload-item-name.tsx";
import { FileUploadItemPreview } from "./file-upload-item-preview.tsx";
import { FileUploadItemPreviewImage } from "./file-upload-item-preview-image.tsx";
import { FileUploadItemSizeText } from "./file-upload-item-size-text.tsx";
import { FileUploadLabel } from "./file-upload-label.tsx";
import { FileUploadRoot } from "./file-upload-root.tsx";
import { FileUploadTrigger } from "./file-upload-trigger.tsx";

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
