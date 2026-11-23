/**
 * Writes `text` into a live region (`aria-live`, rendered empty with the page, so a screen reader
 * follows it before anything is announced; spec/clipboard.md, "Announcements"). The region's
 * content is replaced by a new text node every time, so the same text said twice is announced
 * twice (Toast's live regions append a new node per toast, `/toast`); `""` empties it. The
 * framework renders the region with no children, so it never reconciles this text.
 */
export function announceText(region: HTMLElement, text: string): void {
    region.replaceChildren();
    if (text !== "") {
        region.append(region.ownerDocument.createTextNode(text));
    }
}
