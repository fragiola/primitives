/** A closed kept-mounted overlay's portal content. */
function isHiddenPart(element: HTMLElement): boolean {
    return element.hidden && element.hasAttribute("data-primitives-part");
}

/**
 * Makes everything outside `keep` inert (spec/dialog.md, "Focus"): each sibling of each ancestor
 * of the kept elements, up to `body`. Elements added later (a child layer's portal) are not
 * touched, nor a hidden overlay part (`hidden` and `data-primitives-part`: a kept-mounted
 * overlay's portal content, closed): it takes no interaction while hidden, and an overlay opened
 * from the kept elements later shows it again, which an inert would leave unusable. Returns the
 * restore.
 */
export function inertOutside(keep: readonly Element[]): () => void {
    const first = keep[0];
    if (first === undefined) {
        return () => {};
    }
    const body = first.ownerDocument.body;
    const marked: HTMLElement[] = [];
    const keepSet = new Set<Element>();
    for (const element of keep) {
        let node: Element | null = element;
        while (node !== null && node !== body) {
            keepSet.add(node);
            node = node.parentElement;
        }
    }
    const walk = (parent: Element) => {
        for (const child of [...parent.children]) {
            if (!(child instanceof HTMLElement) || child.tagName === "SCRIPT") {
                continue;
            }
            if (keep.includes(child) || isHiddenPart(child)) {
                continue;
            }
            if (keepSet.has(child)) {
                walk(child);
            } else if (!child.hasAttribute("inert")) {
                child.setAttribute("inert", "");
                marked.push(child);
            }
        }
    };
    walk(body);
    return () => {
        for (const element of marked) {
            element.removeAttribute("inert");
        }
    };
}
