/**
 * Puts `files` into a file input (spec/file-upload.md, "Forms"): a `DataTransfer` of the input's
 * window, built with them, gives its `files` list to `input.files`, so the native form submits
 * them, `required` validates them and a `FormData` holds them. Verified in Chromium; Firefox
 * (57+) and Safari (14.1+) accept the same assignment. Returns `false` where the window has no
 * `DataTransfer` constructor (the input keeps its files).
 */
export function assignFiles(
    input: HTMLInputElement,
    files: readonly File[],
): boolean {
    const view = input.ownerDocument.defaultView as
        | (Window & typeof globalThis)
        | null;
    if (view === null || typeof view.DataTransfer !== "function") {
        return false;
    }
    try {
        const transfer = new view.DataTransfer();
        for (const file of files) {
            transfer.items.add(file);
        }
        input.files = transfer.files;
        return true;
    } catch {
        return false;
    }
}
