import { watchFileDrop } from "@fragiola/primitives/file";
import {
    type ComputedRef,
    computed,
    type ShallowRef,
    shallowRef,
    watch,
} from "vue";
import type { ChangeReason } from "../utils/change-details.ts";

export interface FileDropTargetOptions {
    disabled: () => boolean;
    /** Files dropped (`drop`) or pasted (`input-paste`). */
    onFiles: (files: File[], reason: ChangeReason, event: Event) => void;
    /** A drag of files entered or left. */
    onDropTargetChange?: ((active: boolean, event: Event) => void) | undefined;
    /** A click, Enter or Space: the file dialog's opening. */
    onActivate: (event: Event) => void;
}

/**
 * A drop target for files on `element` (spec/drop-zone.md): the toolkit's `watchFileDrop` (native
 * listeners), its drag state for `data-drop-target`. DropZone's Root and FileUpload's Dropzone
 * share it.
 */
export function useFileDropTarget(
    element: ShallowRef<HTMLElement | null>,
    options: FileDropTargetOptions,
): ComputedRef<boolean> {
    const active = shallowRef(false);
    watch(
        element,
        (target, _, onCleanup) => {
            if (target === null) {
                return;
            }
            onCleanup(
                watchFileDrop(target, {
                    disabled: options.disabled,
                    onDropTargetChange: (next, event) => {
                        active.value = next;
                        options.onDropTargetChange?.(next, event);
                    },
                    onFiles: (files, reason, event) =>
                        options.onFiles(
                            files,
                            reason === "drop" ? "drop" : "input-paste",
                            event,
                        ),
                    onActivate: options.onActivate,
                }),
            );
        },
        { flush: "post" },
    );
    watch(options.disabled, (disabled) => {
        if (disabled) {
            active.value = false;
        }
    });
    return computed(() => active.value && !options.disabled());
}
