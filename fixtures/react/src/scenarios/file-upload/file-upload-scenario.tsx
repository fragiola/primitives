import type {
    ChangeDetails,
    FileUploadPickDetails,
} from "@fragiola/primitives-react/file-upload";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { FileUpload } from "../../kit/ui/file-upload.tsx";
import { fileNames, rejections } from "./file-upload-output.ts";

/**
 * The attachments uploader of `/file-upload/basic` and `/file-upload/disabled`
 * (spec/file-upload.md); its output inside the Root, which holds the rejected list.
 */
export function FileUploadScenario({ disabled }: { disabled?: boolean }) {
    const [value, setValue] = useState<File[]>([]);
    const [reason, setReason] = useState<string>();
    return (
        <>
            <FileUpload.Root
                maxFiles={3}
                accept="image/*,.pdf"
                maxFileSize={1_000_000}
                minFileSize={1}
                validate={(file: File) =>
                    file.name.includes(" ") ? ["name-has-spaces"] : null
                }
                locale="en-US"
                disabled={disabled}
                value={value}
                onValueChange={(next: File[], details: ChangeDetails) => {
                    setValue(next);
                    setReason(details.reason);
                }}
                onFileReject={(_rejected, details: ChangeDetails) =>
                    setReason(details.reason)
                }
                announcement={(details: FileUploadPickDetails) =>
                    `${details.value.length} files, ${details.rejectedFiles.length} rejected`
                }
            >
                {({ value: files, rejectedFiles }) => (
                    <>
                        <FileUpload.Label>Attachments</FileUpload.Label>
                        <FileUpload.Dropzone>
                            Drop files here
                        </FileUpload.Dropzone>
                        <div className="flex items-center gap-2">
                            <FileUpload.Trigger>
                                Choose files
                            </FileUpload.Trigger>
                            <FileUpload.ClearTrigger>
                                Clear all
                            </FileUpload.ClearTrigger>
                        </div>
                        <FileUpload.HiddenInput />
                        <FileUpload.ItemGroup data-testid="accepted">
                            {files.map((file) => (
                                <FileUpload.Item key={file.name} file={file}>
                                    <FileUpload.ItemPreview>
                                        <FileUpload.ItemPreviewImage alt="" />
                                    </FileUpload.ItemPreview>
                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <FileUpload.ItemName />
                                        <FileUpload.ItemSizeText />
                                    </div>
                                    <FileUpload.ItemDeleteTrigger
                                        aria-label={`Remove ${file.name}`}
                                    >
                                        ×
                                    </FileUpload.ItemDeleteTrigger>
                                </FileUpload.Item>
                            ))}
                        </FileUpload.ItemGroup>
                        <FileUpload.ItemGroup data-testid="rejected">
                            {rejectedFiles.map((entry) => (
                                <FileUpload.Item
                                    key={entry.file.name}
                                    file={entry.file}
                                >
                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <FileUpload.ItemName />
                                        <span className="text-xs">
                                            {entry.reasons.join(", ")}
                                        </span>
                                    </div>
                                    <FileUpload.ItemDeleteTrigger
                                        aria-label={`Dismiss ${entry.file.name}`}
                                    >
                                        ×
                                    </FileUpload.ItemDeleteTrigger>
                                </FileUpload.Item>
                            ))}
                        </FileUpload.ItemGroup>
                        <Output
                            values={{
                                value: fileNames(files),
                                rejected: rejections(rejectedFiles),
                                reason,
                            }}
                        />
                    </>
                )}
            </FileUpload.Root>
        </>
    );
}
