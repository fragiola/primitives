import { useEffect, useMemo } from "react";
import { useElement } from "../../hooks/use-element.ts";
import { useFileDropTarget } from "../../hooks/use-file-drop-target.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { mergeRefs } from "../../utils/merge-refs.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    FileUploadContext,
    type FileUploadState,
    fileUploadState,
} from "./file-upload-context.ts";

export type FileUploadDropzoneProps = PartProps<FileUploadState>;

/**
 * DropZone's drop target inside a FileUpload (spec/file-upload.md): its drops and pastes are the
 * Root's picks, its press opens the HiddenInput's dialog.
 */
export function FileUploadDropzone(props: FileUploadDropzoneProps) {
    const context = useRequiredContext(
        FileUploadContext,
        "FileUpload.Dropzone",
    );
    const [element, setElement] = useElement<HTMLElement>();
    const { setDropzone, setDropTarget, disabled } = context;
    const ref = useMemo(
        () => mergeRefs(setElement, setDropzone),
        [setElement, setDropzone],
    );
    const dropTarget = useFileDropTarget(element, {
        disabled,
        onFiles: context.pick,
        onDropTargetChange: (active) => setDropTarget(active),
        onActivate: context.openDialog,
    });
    useEffect(() => {
        if (disabled) {
            setDropTarget(false);
        }
    }, [disabled, setDropTarget]);
    return renderElement(
        "div",
        props,
        fileUploadState(context),
        {
            role: "button",
            tabIndex: disabled ? undefined : 0,
            "aria-disabled": disabled ? "true" : undefined,
            "data-primitives-part": "file-upload-dropzone",
            ...context.attributes,
            ...stateAttributes({ "drop-target": dropTarget }),
        },
        ref,
    );
}
