import { Field } from "@fragiola/primitives-react/field";
import {
    FileUpload,
    type FileUploadPickDetails,
} from "@fragiola/primitives-react/file-upload";
import { useState } from "react";
import { styles } from "./styles.ts";

const MESSAGES: Record<string, string> = {
    "invalid-type": "not an image or a PDF",
    "too-large": "over 5 MB",
    "too-many": "more than 4 files",
};

const explain = (reasons: readonly string[]) =>
    reasons.map((reason) => MESSAGES[reason] ?? reason).join(", ");

const announce = (details: FileUploadPickDetails) =>
    `${details.value.length} attached, ${details.rejectedFiles.length} rejected`;

// A required Field of attachments: drop files on the zone, paste them on it or pick them in the
// dialog; each pick is checked by type, size and count, the accepted files list their name and
// size with a remove button, the rejected ones say why, and a polite region announces the pick.
// The form submits the files through the hidden file input (spec/file-upload.md).
export default function AttachmentsField() {
    const [sent, setSent] = useState<string | null>(null);
    return (
        <form
            className={styles.form}
            onSubmit={(event) => {
                event.preventDefault();
                const files = new FormData(event.currentTarget)
                    .getAll("attachments")
                    .filter((entry): entry is File => entry instanceof File);
                setSent(files.map((file) => file.name).join(", "));
            }}
        >
            <Field.Root name="attachments" className={styles.field.root}>
                <Field.Label className={styles.field.label}>
                    Attachments
                </Field.Label>
                <FileUpload.Root
                    maxFiles={4}
                    maxFileSize={5_000_000}
                    accept="image/*,.pdf"
                    required
                    announcement={announce}
                    className={styles.root}
                >
                    {({ value, rejectedFiles }) => (
                        <>
                            <FileUpload.Dropzone className={styles.dropzone}>
                                Drop images or PDFs here, or press to choose
                            </FileUpload.Dropzone>
                            <div className={styles.actions}>
                                <FileUpload.Trigger className={styles.trigger}>
                                    Choose files
                                </FileUpload.Trigger>
                                <FileUpload.ClearTrigger
                                    className={styles.clearTrigger}
                                >
                                    Clear all
                                </FileUpload.ClearTrigger>
                            </div>
                            <FileUpload.HiddenInput />
                            <FileUpload.ItemGroup className={styles.itemGroup}>
                                {value.map((file) => (
                                    <FileUpload.Item
                                        key={file.name}
                                        file={file}
                                        className={styles.item}
                                    >
                                        <div className={styles.itemText}>
                                            <FileUpload.ItemName
                                                className={styles.itemName}
                                            />
                                            <FileUpload.ItemSizeText
                                                className={styles.itemSizeText}
                                            />
                                        </div>
                                        <FileUpload.ItemDeleteTrigger
                                            aria-label={`Remove ${file.name}`}
                                            className={styles.itemDeleteTrigger}
                                        >
                                            ×
                                        </FileUpload.ItemDeleteTrigger>
                                    </FileUpload.Item>
                                ))}
                            </FileUpload.ItemGroup>
                            <FileUpload.ItemGroup className={styles.itemGroup}>
                                {rejectedFiles.map((entry) => (
                                    <FileUpload.Item
                                        key={entry.file.name}
                                        file={entry.file}
                                        className={styles.item}
                                    >
                                        <div className={styles.itemText}>
                                            <FileUpload.ItemName
                                                className={styles.itemName}
                                            />
                                            <span className={styles.reasons}>
                                                {explain(entry.reasons)}
                                            </span>
                                        </div>
                                        <FileUpload.ItemDeleteTrigger
                                            aria-label={`Dismiss ${entry.file.name}`}
                                            className={styles.itemDeleteTrigger}
                                        >
                                            ×
                                        </FileUpload.ItemDeleteTrigger>
                                    </FileUpload.Item>
                                ))}
                            </FileUpload.ItemGroup>
                        </>
                    )}
                </FileUpload.Root>
                <Field.Description className={styles.field.description}>
                    Up to 4 images or PDFs, 5 MB each.
                </Field.Description>
                <Field.Error
                    match="valueMissing"
                    className={styles.field.error}
                >
                    Add at least one file.
                </Field.Error>
            </Field.Root>
            <button type="submit" className={styles.submit}>
                Send
            </button>
            <p role="status" className={styles.status}>
                {sent === null ? "" : `Sent: ${sent}`}
            </p>
        </form>
    );
}
