import type { ChangeDetails } from "@fragiola/primitives-react/file-upload";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { FileUpload } from "../../kit/ui/file-upload.tsx";
import { fileNames } from "./file-upload-output.ts";

/** A required FileUpload in a Field of a native form (spec/file-upload.md, `/file-upload/form`). */
export function FileUploadForm() {
    const [submitted, setSubmitted] = useState<string>();
    const [value, setValue] = useState<string>();
    const [reason, setReason] = useState<string>();
    return (
        <>
            <form
                className="flex flex-col items-start gap-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    const files = new FormData(event.currentTarget)
                        .getAll("attachments")
                        .filter((entry): entry is File => entry instanceof File)
                        .map((file) => `${file.name}:${file.size}`);
                    setSubmitted(
                        files.length === 0 ? "none" : files.join(", "),
                    );
                }}
            >
                <Field.Root name="attachments">
                    <Field.Label>Documents</Field.Label>
                    <FileUpload.Root
                        maxFiles={5}
                        required
                        onValueChange={(
                            next: File[],
                            details: ChangeDetails,
                        ) => {
                            setValue(fileNames(next));
                            setReason(details.reason);
                        }}
                    >
                        {({ value: files }) => (
                            <>
                                <FileUpload.Dropzone>
                                    Drop documents
                                </FileUpload.Dropzone>
                                <div className="flex items-center gap-2">
                                    <FileUpload.Trigger>
                                        Choose documents
                                    </FileUpload.Trigger>
                                </div>
                                <FileUpload.HiddenInput />
                                <FileUpload.ItemGroup>
                                    {files.map((file) => (
                                        <FileUpload.Item
                                            key={file.name}
                                            file={file}
                                        >
                                            <FileUpload.ItemName />
                                            <FileUpload.ItemDeleteTrigger
                                                aria-label={`Remove ${file.name}`}
                                            >
                                                ×
                                            </FileUpload.ItemDeleteTrigger>
                                        </FileUpload.Item>
                                    ))}
                                </FileUpload.ItemGroup>
                            </>
                        )}
                    </FileUpload.Root>
                    <Field.Error match="valueMissing">
                        Add at least one document
                    </Field.Error>
                </Field.Root>
                <div className="flex gap-2">
                    <button type="submit">Send</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <Output values={{ submitted, value, reason }} />
        </>
    );
}
