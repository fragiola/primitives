import { useLayoutEffect } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    FileUploadContext,
    type FileUploadState,
    fileUploadState,
} from "./file-upload-context.ts";

export type FileUploadLabelProps = PartProps<FileUploadState>;

/** The label of the HiddenInput (a press opens the dialog), naming the Root (spec/file-upload.md). */
export function FileUploadLabel(props: FileUploadLabelProps) {
    const context = useRequiredContext(FileUploadContext, "FileUpload.Label");
    const { setLabelled } = context;
    useLayoutEffect(() => {
        setLabelled(true);
        return () => setLabelled(false);
    }, [setLabelled]);
    return renderElement("label", props, fileUploadState(context), {
        id: context.labelId,
        htmlFor: context.inputId,
        "data-primitives-part": "file-upload-label",
        ...context.attributes,
    });
}
