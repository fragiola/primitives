import { watchFileDrop } from "@fragiola/primitives/file";
import { useEffect, useRef, useState } from "react";
import type { ChangeReason } from "../utils/change-details.ts";

export interface FileDropTargetOptions {
    disabled: boolean;
    /** Files dropped (`drop`) or pasted (`input-paste`). */
    onFiles: (files: File[], reason: ChangeReason, event: Event) => void;
    /** A drag of files entered or left. */
    onDropTargetChange?: ((active: boolean, event: Event) => void) | undefined;
    /** A click, Enter or Space: the file dialog's opening. */
    onActivate: (event: Event) => void;
}

/**
 * A drop target for files on `element` (spec/drop-zone.md): the toolkit's `watchFileDrop`, its
 * drag state for `data-drop-target`. DropZone's Root and FileUpload's Dropzone share it.
 */
export function useFileDropTarget(
    element: HTMLElement | null,
    options: FileDropTargetOptions,
): boolean {
    const [dropTarget, setDropTarget] = useState(false);
    const latest = useRef(options);
    latest.current = options;
    useEffect(() => {
        if (element === null) {
            return undefined;
        }
        return watchFileDrop(element, {
            disabled: () => latest.current.disabled,
            onDropTargetChange: (active, event) => {
                setDropTarget(active);
                latest.current.onDropTargetChange?.(active, event);
            },
            onFiles: (files, reason, event) =>
                latest.current.onFiles(
                    files,
                    reason === "drop" ? "drop" : "input-paste",
                    event,
                ),
            onActivate: (event) => latest.current.onActivate(event),
        });
    }, [element]);
    const { disabled } = options;
    useEffect(() => {
        if (disabled) {
            setDropTarget(false);
        }
    }, [disabled]);
    return dropTarget && !disabled;
}
