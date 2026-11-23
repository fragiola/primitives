/**
 * Writes `text` to the system clipboard of `element`'s window (spec/clipboard.md, "Copying"):
 * the asynchronous Clipboard API (`navigator.clipboard.writeText`), which needs a secure context
 * and, in some browsers, the `clipboard-write` permission or a user activation. There is no
 * `execCommand("copy")` fallback: where the API is missing (an insecure context, an old browser)
 * the promise rejects, as it does when the browser refuses the write, and the component reports
 * the failure (its `failed` status) and selects its Input's text, so the user can copy it by hand.
 */
export function writeClipboard(element: Element, text: string): Promise<void> {
    const clipboard = element.ownerDocument.defaultView?.navigator.clipboard;
    if (clipboard === undefined || typeof clipboard.writeText !== "function") {
        return Promise.reject(
            new Error("The Clipboard API is not available in this context."),
        );
    }
    try {
        return clipboard.writeText(text);
    } catch (error) {
        return Promise.reject(error);
    }
}
