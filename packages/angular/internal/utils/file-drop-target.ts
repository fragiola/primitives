import {
    afterNextRender,
    computed,
    DestroyRef,
    inject,
    type Signal,
    signal,
    untracked,
} from "@angular/core";
// types only: the file entries pass the toolkit's `watchFileDrop` in, so this shared entry imports
// nothing of `/file` and the components that do not take files never reference it
import type { watchFileDrop } from "@fragiola/primitives/file";
import type { ChangeReason } from "./change-details.ts";

export interface FileDropTargetOptions {
    /** The toolkit's `watchFileDrop`, passed in by the entry that imports `/file`. */
    watch: typeof watchFileDrop;
    disabled: Signal<boolean>;
    /** Files dropped (`drop`) or pasted (`input-paste`). */
    onFiles: (files: File[], reason: ChangeReason, event: Event) => void;
    /** A drag of files entered or left. */
    onDropTargetChange?: (active: boolean, event: Event) => void;
    /** A click, Enter or Space: the file dialog's opening. */
    onActivate: (event: Event) => void;
}

/**
 * A drop target for files on `host` (spec/drop-zone.md), in its directive's injection context:
 * the toolkit's `watchFileDrop` once the page renders in the browser, and its drag state for
 * `data-drop-target` (none while disabled). DropZone's Root and FileUpload's Dropzone share it.
 */
export function fileDropTarget(
    host: HTMLElement,
    options: FileDropTargetOptions,
): Signal<boolean> {
    const active = signal(false);
    let stop: (() => void) | null = null;
    afterNextRender(() => {
        stop = options.watch(host, {
            disabled: () => untracked(options.disabled),
            onDropTargetChange: (next, event) => {
                active.set(next);
                options.onDropTargetChange?.(next, event);
            },
            onFiles: (files, reason, event) =>
                options.onFiles(
                    files,
                    reason === "drop" ? "drop" : "input-paste",
                    event,
                ),
            onActivate: options.onActivate,
        });
    });
    inject(DestroyRef).onDestroy(() => stop?.());
    return computed(() => active() && !options.disabled());
}
