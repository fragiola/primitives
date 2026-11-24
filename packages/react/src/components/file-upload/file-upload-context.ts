import type { FileRejection } from "@fragiola/primitives/file";
import { createContext } from "react";
import type { ChangeReason } from "../../utils/change-details.ts";

/** The state every part renders with (spec/file-upload.md, "API"). */
export interface FileUploadState {
    /** The accepted files. */
    value: File[];
    /** The last pick's rejected files, with their reasons. */
    rejectedFiles: FileRejection<File>[];
    disabled: boolean;
    /** No accepted file. */
    empty: boolean;
    /** A drag of files is over the Dropzone. */
    dropTarget: boolean;
}

export interface FileUploadContextValue extends FileUploadState {
    inputId: string;
    labelId: string;
    name: string | undefined;
    accept: string | undefined;
    multiple: boolean;
    capture: "user" | "environment" | undefined;
    required: boolean;
    locale: string | undefined;
    /** The Field's state attributes and the Root's own, for every part. */
    attributes: Record<`data-${string}`, string>;
    setLabelled: (labelled: boolean) => void;
    setInput: (element: HTMLInputElement | null) => void;
    setTrigger: (element: HTMLElement | null) => void;
    setDropzone: (element: HTMLElement | null) => void;
    setDropTarget: (active: boolean) => void;
    /** New files from the dialog, a drop or a paste. */
    pick: (files: File[], reason: ChangeReason, event: Event) => void;
    openDialog: () => void;
    /** Removes a file from the value or the rejected list, moving the focus on. */
    remove: (file: File, event: Event, button: HTMLElement) => void;
    clear: (event: Event) => void;
}

export const FileUploadContext = createContext<FileUploadContextValue | null>(
    null,
);

export function fileUploadState(
    context: FileUploadContextValue,
): FileUploadState {
    return {
        value: context.value,
        rejectedFiles: context.rejectedFiles,
        disabled: context.disabled,
        empty: context.empty,
        dropTarget: context.dropTarget,
    };
}

/** An Item's state: the Root's, and its file. */
export interface FileUploadItemState extends FileUploadState {
    file: File;
    rejected: boolean;
    /** A rejected file's reasons (`[]` for an accepted one). */
    reasons: readonly string[];
}

export interface FileUploadItemContextValue {
    file: File;
    rejected: boolean;
    reasons: readonly string[];
    attributes: Record<`data-${string}`, string>;
}

export const FileUploadItemContext =
    createContext<FileUploadItemContextValue | null>(null);
