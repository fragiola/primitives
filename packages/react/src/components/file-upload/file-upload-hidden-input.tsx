import { VISUALLY_HIDDEN_INPUT_STYLE } from "@fragiola/primitives/form";
import type { ChangeEvent } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    FileUploadContext,
    type FileUploadState,
    fileUploadState,
} from "./file-upload-context.ts";

export type FileUploadHiddenInputProps = PartProps<FileUploadState>;

/**
 * The native file input: the form's control, its files the value (spec/file-upload.md, "Forms").
 * Hidden from the tab order and the accessibility tree; the Trigger and the Dropzone open it.
 */
export function FileUploadHiddenInput(props: FileUploadHiddenInputProps) {
    const context = useRequiredContext(
        FileUploadContext,
        "FileUpload.HiddenInput",
    );
    return renderElement(
        "input",
        props,
        fileUploadState(context),
        {
            type: "file",
            id: context.inputId,
            name: context.name,
            accept: context.accept,
            multiple: context.multiple,
            capture: context.capture,
            required: context.required,
            disabled: context.disabled,
            tabIndex: -1,
            "aria-hidden": "true",
            style: VISUALLY_HIDDEN_INPUT_STYLE,
            "data-primitives-part": "file-upload-hidden-input",
            onChange: (event: ChangeEvent<HTMLInputElement>) => {
                const files = [...(event.currentTarget.files ?? [])];
                if (files.length > 0) {
                    context.pick(files, "input-change", event.nativeEvent);
                }
            },
        },
        context.setInput as (element: HTMLElement | null) => void,
    );
}
