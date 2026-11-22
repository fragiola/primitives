/**
 * Scrolls the scrollable ancestors of `item`, up to `boundary` (included), so the item is in view
 * at the nearest edge: a highlighted option inside its popup (spec/select.md, spec/combobox.md).
 * Unlike `Element.scrollIntoView`, it never scrolls past `boundary`: a list that mounts before it
 * is positioned (at the end of a tall page) does not scroll the page.
 */
export function scrollIntoViewWithin(
    item: HTMLElement,
    boundary: HTMLElement | null,
): void {
    if (boundary === null || !boundary.contains(item)) {
        return;
    }
    const view = item.ownerDocument.defaultView;
    for (
        let element = item.parentElement;
        element !== null;
        element = element.parentElement
    ) {
        const overflow = view?.getComputedStyle(element).overflowY ?? "";
        if (
            element.scrollHeight > element.clientHeight &&
            (overflow === "auto" || overflow === "scroll")
        ) {
            // the visible scroll area: inside the border, above a horizontal scrollbar
            const top = element.getBoundingClientRect().top + element.clientTop;
            const bottom = top + element.clientHeight;
            const rect = item.getBoundingClientRect();
            if (rect.top < top) {
                element.scrollTop -= top - rect.top;
            } else if (rect.bottom > bottom) {
                element.scrollTop += rect.bottom - bottom;
            }
        }
        if (element === boundary) {
            return;
        }
    }
}
