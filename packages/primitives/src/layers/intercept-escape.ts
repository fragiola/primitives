/**
 * Calls `onEscape` on Escape before the document's overlay layers see the key, and consumes it
 * (spec/tooltip.md: "Escape closes it and stops there"). It listens in the capture phase of the
 * document's window, which runs before the layer stack's listener on the document; the key is
 * then prevented and stopped, and the stack ignores a prevented key, so an enclosing dialog,
 * popover or menu stays open. Returns the cleanup.
 */
export function interceptEscape(
    doc: Document,
    onEscape: (event: KeyboardEvent) => void,
): () => void {
    const target: Document | Window = doc.defaultView ?? doc;
    const onKeyDown = (event: Event) => {
        if (
            !(event instanceof KeyboardEvent) ||
            event.key !== "Escape" ||
            event.defaultPrevented
        ) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        onEscape(event);
    };
    target.addEventListener("keydown", onKeyDown, true);
    return () => target.removeEventListener("keydown", onKeyDown, true);
}
