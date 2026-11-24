/** Why files arrived on a drop target (spec/drop-zone.md). */
export type FileDropReason = "drop" | "paste";

export interface FileDropOptions {
    /** Read on every event: a disabled target takes nothing. */
    disabled: () => boolean;
    /** A drag of files entered the target (`true`), or left it, dropped or ended (`false`). */
    onDropTargetChange: (active: boolean, event: Event) => void;
    /** Files were dropped or pasted (never called with none). */
    onFiles: (files: File[], reason: FileDropReason, event: Event) => void;
    /** A press: a click, Enter or Space (the file dialog's opening). */
    onActivate?: ((event: Event) => void) | undefined;
}

/** Whether a drag carries files (`dataTransfer.types` holds `"Files"`). */
export function dragHasFiles(event: DragEvent): boolean {
    const types = event.dataTransfer?.types;
    return types !== undefined && [...types].includes("Files");
}

/**
 * Makes `element` a target for files (spec/drop-zone.md, "Pointer", "Keyboard"): a drag of files
 * over it (counted across its children's enters and leaves) is reported and shows the `copy`
 * effect, its drop hands over the files, and a paste on it hands over the clipboard's files; a
 * drag of anything else is left alone. While `disabled()`, a drag of files shows the `none` effect
 * and its drop is canceled, so the browser does not open the file. A click, Enter or Space is a
 * press (`onActivate`; Space and Enter do not scroll the page nor repeat). Native listeners, so
 * every framework sees the same events. Returns the cleanup.
 */
export function watchFileDrop(
    element: HTMLElement,
    options: FileDropOptions,
): () => void {
    let depth = 0;
    const end = (event: Event) => {
        if (depth > 0) {
            depth = 0;
            options.onDropTargetChange(false, event);
        }
    };
    const onDragEnter = (event: DragEvent) => {
        if (!dragHasFiles(event)) {
            return;
        }
        event.preventDefault();
        if (options.disabled()) {
            return;
        }
        depth += 1;
        if (depth === 1) {
            options.onDropTargetChange(true, event);
        }
    };
    const onDragOver = (event: DragEvent) => {
        if (!dragHasFiles(event)) {
            return;
        }
        event.preventDefault();
        if (event.dataTransfer !== null) {
            event.dataTransfer.dropEffect = options.disabled()
                ? "none"
                : "copy";
        }
    };
    const onDragLeave = (event: DragEvent) => {
        if (depth === 0) {
            return;
        }
        depth -= 1;
        if (depth === 0) {
            options.onDropTargetChange(false, event);
        }
    };
    const onDrop = (event: DragEvent) => {
        if (!dragHasFiles(event)) {
            return;
        }
        event.preventDefault();
        end(event);
        if (options.disabled()) {
            return;
        }
        const files = [...(event.dataTransfer?.files ?? [])];
        if (files.length > 0) {
            options.onFiles(files, "drop", event);
        }
    };
    const onPaste = (event: ClipboardEvent) => {
        if (options.disabled()) {
            return;
        }
        const files = [...(event.clipboardData?.files ?? [])];
        if (files.length > 0) {
            event.preventDefault();
            options.onFiles(files, "paste", event);
        }
    };
    const onClick = (event: MouseEvent) => {
        // the click a file input inside the target gets when it is opened bubbles here: it is
        // no press (it would open the dialog again)
        if ((event.target as Element | null)?.tagName === "INPUT") {
            return;
        }
        if (!options.disabled()) {
            options.onActivate?.(event);
        }
    };
    const onKeyDown = (event: KeyboardEvent) => {
        if (
            event.target !== element ||
            (event.key !== "Enter" && event.key !== " ")
        ) {
            return;
        }
        event.preventDefault();
        if (!event.repeat && !options.disabled()) {
            options.onActivate?.(event);
        }
    };
    element.addEventListener("dragenter", onDragEnter);
    element.addEventListener("dragover", onDragOver);
    element.addEventListener("dragleave", onDragLeave);
    element.addEventListener("drop", onDrop);
    element.addEventListener("paste", onPaste);
    element.addEventListener("click", onClick);
    element.addEventListener("keydown", onKeyDown);
    return () => {
        element.removeEventListener("dragenter", onDragEnter);
        element.removeEventListener("dragover", onDragOver);
        element.removeEventListener("dragleave", onDragLeave);
        element.removeEventListener("drop", onDrop);
        element.removeEventListener("paste", onPaste);
        element.removeEventListener("click", onClick);
        element.removeEventListener("keydown", onKeyDown);
    };
}
