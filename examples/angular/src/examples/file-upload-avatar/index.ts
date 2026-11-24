import { Component } from "@angular/core";
import {
    FileUploadDropzone,
    FileUploadHiddenInput,
    FileUploadItem,
    FileUploadItemDeleteTrigger,
    FileUploadItemGroup,
    FileUploadItemPreview,
    FileUploadItemPreviewImage,
    FileUploadLabel,
    FileUploadRoot,
    FileUploadTrigger,
} from "@fragiola/primitives-angular/file-upload";
import { styles } from "./styles.ts";

// One profile photo: an image dropped on the round zone or picked in the dialog replaces the
// current one (a single file input's behaviour), its preview an object URL the primitive revokes
// when the photo is replaced or removed (spec/file-upload.md).
@Component({
    selector: "example-avatar-uploader",
    imports: [
        FileUploadRoot,
        FileUploadLabel,
        FileUploadDropzone,
        FileUploadTrigger,
        FileUploadHiddenInput,
        FileUploadItemGroup,
        FileUploadItem,
        FileUploadItemPreview,
        FileUploadItemPreviewImage,
        FileUploadItemDeleteTrigger,
    ],
    template: `
        <div fileUploadRoot #upload="fileUploadRoot" [accept]="'image/*'" [class]="styles.root">
            <label fileUploadLabel [class]="styles.label">Profile photo</label>
            <div [class]="styles.row">
                <div fileUploadDropzone [class]="styles.dropzone">Drop a photo</div>
                <ul fileUploadItemGroup [class]="styles.itemGroup">
                    @for (file of upload.state().value; track file.name) {
                        <li fileUploadItem [file]="file" [class]="styles.item">
                            <div *fileUploadItemPreview [class]="styles.preview"><img fileUploadItemPreviewImage alt="Profile photo preview" [class]="styles.image" /></div>
                            <button fileUploadItemDeleteTrigger [class]="styles.itemDeleteTrigger">Remove photo</button>
                        </li>
                    }
                </ul>
            </div>
            <button fileUploadTrigger [class]="styles.trigger">Choose photo</button>
            <input fileUploadHiddenInput />
        </div>
    `,
})
export default class AvatarUploader {
    protected readonly styles = styles;
}
