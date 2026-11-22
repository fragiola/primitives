const blocks = new WeakMap<Document, { count: number; restore: () => void }>();

/**
 * Blocks the pointer outside a modal overlay (spec/menu.md, "Modal"): the body stops taking
 * pointer events (`pointer-events: none`), so a press outside reaches no element of the page and
 * only dismisses the overlay; the overlay's own elements opt back in with `pointer-events: auto`.
 * Nested blocks are counted. Returns the restore.
 */
export function blockOutsidePointer(doc: Document): () => void {
    const existing = blocks.get(doc);
    if (existing !== undefined) {
        existing.count += 1;
    } else {
        const body = doc.body;
        const previous = body.style.pointerEvents;
        body.style.pointerEvents = "none";
        blocks.set(doc, {
            count: 1,
            restore: () => {
                body.style.pointerEvents = previous;
            },
        });
    }
    let released = false;
    return () => {
        if (released) {
            return;
        }
        released = true;
        const block = blocks.get(doc);
        if (block === undefined) {
            return;
        }
        block.count -= 1;
        if (block.count === 0) {
            block.restore();
            blocks.delete(doc);
        }
    };
}
