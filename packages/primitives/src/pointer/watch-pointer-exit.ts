/**
 * Calls `onExit` when a mouse or pen pointer leaves the document: the window, or the iframe the
 * document is in (a `pointerout` with no `relatedTarget`). A pointer that leaves at once sends no
 * move outside a hover bridge first, so a hover-opened overlay listens to this too (Epic #49:
 * spec/tooltip.md and navigation-menu.md, "Pointer"). A touch's `pointerout` after its release
 * is no exit, nor is the pointer entering an iframe of the page (its `pointerout` has no
 * `relatedTarget` either: the point is then inside the viewport, over the frame). Returns the
 * cleanup.
 */
export function watchPointerExit(
    doc: Document,
    onExit: (event: PointerEvent) => void,
): () => void {
    const onOut = (event: Event) => {
        const pointer = event as PointerEvent;
        if (
            pointer.relatedTarget === null &&
            pointer.pointerType !== "touch" &&
            !entersFrame(doc, pointer)
        ) {
            onExit(pointer);
        }
    };
    doc.addEventListener("pointerout", onOut);
    return () => doc.removeEventListener("pointerout", onOut);
}

/** The elements whose own document a pointer enters (no `relatedTarget` in the page's). */
const FRAMES: readonly string[] = ["IFRAME", "FRAME", "OBJECT", "EMBED"];

/**
 * Whether a `pointerout` with no `relatedTarget` is the pointer entering a frame of the page:
 * its point is inside the viewport, over a frame element. A point outside the viewport, or over
 * anything else (a quick exit reports the last point inside), is the pointer leaving.
 */
function entersFrame(doc: Document, event: PointerEvent): boolean {
    const view = doc.defaultView;
    const { clientX: x, clientY: y } = event;
    if (
        view === null ||
        typeof doc.elementFromPoint !== "function" ||
        x < 0 ||
        y < 0 ||
        x >= view.innerWidth ||
        y >= view.innerHeight
    ) {
        return false;
    }
    const element = doc.elementFromPoint(x, y);
    return element !== null && FRAMES.includes(element.tagName);
}
