import { acceptAttribute, type FileAccept } from "./accept-files.ts";

export interface FileDialogOptions {
    accept?: FileAccept | undefined;
    multiple?: boolean | undefined;
    /** The camera a phone opens (`user`, `environment`), as a file input's `capture`. */
    capture?: "user" | "environment" | undefined;
}

/**
 * Opens the browser's file dialog for `element`'s document (spec/drop-zone.md, "Purpose"): a file
 * `input` created for this press, never put in the document, clicked in the press's user
 * activation. `onFiles` receives the files picked, and is not called when the dialog closes with
 * none.
 */
export function openFileDialog(
    element: Element,
    options: FileDialogOptions,
    onFiles: (files: File[], event: Event) => void,
): void {
    const input = element.ownerDocument.createElement("input");
    input.type = "file";
    const accept = acceptAttribute(options.accept);
    if (accept !== undefined) {
        input.accept = accept;
    }
    input.multiple = options.multiple ?? false;
    if (options.capture !== undefined) {
        input.setAttribute("capture", options.capture);
    }
    input.addEventListener(
        "change",
        (event) => {
            const files = [...(input.files ?? [])];
            if (files.length > 0) {
                onFiles(files, event);
            }
        },
        { once: true },
    );
    input.click();
}
