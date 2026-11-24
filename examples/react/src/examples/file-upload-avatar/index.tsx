import { FileUpload } from "@fragiola/primitives-react/file-upload";
import { styles } from "./styles.ts";

// One profile photo: an image dropped on the round zone or picked in the dialog replaces the
// current one (a single file input's behaviour), its preview an object URL the primitive revokes
// when the photo is replaced or removed (spec/file-upload.md).
export default function AvatarUploader() {
    return (
        <FileUpload.Root accept="image/*" className={styles.root}>
            {({ value }) => (
                <>
                    <FileUpload.Label className={styles.label}>
                        Profile photo
                    </FileUpload.Label>
                    <div className={styles.row}>
                        <FileUpload.Dropzone className={styles.dropzone}>
                            Drop a photo
                        </FileUpload.Dropzone>
                        <FileUpload.ItemGroup className={styles.itemGroup}>
                            {value.map((file) => (
                                <FileUpload.Item
                                    key={file.name}
                                    file={file}
                                    className={styles.item}
                                >
                                    <FileUpload.ItemPreview
                                        className={styles.preview}
                                    >
                                        <FileUpload.ItemPreviewImage
                                            alt="Profile photo preview"
                                            className={styles.image}
                                        />
                                    </FileUpload.ItemPreview>
                                    <FileUpload.ItemDeleteTrigger
                                        className={styles.itemDeleteTrigger}
                                    >
                                        Remove photo
                                    </FileUpload.ItemDeleteTrigger>
                                </FileUpload.Item>
                            ))}
                        </FileUpload.ItemGroup>
                    </div>
                    <FileUpload.Trigger className={styles.trigger}>
                        Choose photo
                    </FileUpload.Trigger>
                    <FileUpload.HiddenInput />
                </>
            )}
        </FileUpload.Root>
    );
}
