import type { ChangeDetails } from "@fragiola/primitives-react/file-upload";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { FileUpload } from "../../kit/ui/file-upload.tsx";
import { fileNames, rejections } from "./file-upload-output.ts";

/** An avatar uploader (spec/file-upload.md, `/file-upload/single`). */
export function FileUploadSingle() {
    const [reason, setReason] = useState<string>();
    const [changes, setChanges] = useState(0);
    return (
        <FileUpload.Root
            accept="image/*"
            onValueChange={(_value: File[], details: ChangeDetails) => {
                setReason(details.reason);
                setChanges((count) => count + 1);
            }}
            onFileReject={(_rejected, details: ChangeDetails) =>
                setReason(details.reason)
            }
        >
            {({ value, rejectedFiles }) => (
                <>
                    <FileUpload.Label>Avatar</FileUpload.Label>
                    <FileUpload.Dropzone>Drop an image</FileUpload.Dropzone>
                    <div className="flex items-center gap-2">
                        <FileUpload.Trigger>Choose image</FileUpload.Trigger>
                    </div>
                    <FileUpload.HiddenInput />
                    <FileUpload.ItemGroup>
                        {value.map((file) => (
                            <FileUpload.Item key={file.name} file={file}>
                                <FileUpload.ItemPreview>
                                    <FileUpload.ItemPreviewImage alt="Avatar preview" />
                                </FileUpload.ItemPreview>
                                <FileUpload.ItemName />
                            </FileUpload.Item>
                        ))}
                    </FileUpload.ItemGroup>
                    <Output
                        values={{
                            value: fileNames(value),
                            rejected: rejections(rejectedFiles),
                            reason,
                            changes,
                        }}
                    />
                </>
            )}
        </FileUpload.Root>
    );
}
