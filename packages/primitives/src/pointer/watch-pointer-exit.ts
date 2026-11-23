/**
 * Calls `onExit` when a mouse or pen pointer leaves the document: the window, or the iframe the
 * document is in (a `pointerout` with no `relatedTarget`). A pointer that leaves at once sends no
 * move outside a hover bridge first, so a hover-opened overlay listens to this too (Epic #49:
 * spec/tooltip.md and navigation-menu.md, "Pointer"). A touch's `pointerout` after its release
 * is no exit. Returns the cleanup.
 */
export function watchPointerExit(
    doc: Document,
    onExit: (event: PointerEvent) => void,
): () => void {
    const onOut = (event: Event) => {
        const pointer = event as PointerEvent;
        if (pointer.relatedTarget === null && pointer.pointerType !== "touch") {
            onExit(pointer);
        }
    };
    doc.addEventListener("pointerout", onOut);
    return () => doc.removeEventListener("pointerout", onOut);
}
