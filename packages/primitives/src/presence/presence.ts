/** Runs `callback` on the next animation frame of the element's window. Returns the cancel. */
export function nextFrame(element: Element, callback: () => void): () => void {
    const view = element.ownerDocument.defaultView;
    if (view === null) {
        callback();
        return () => {};
    }
    const id = view.requestAnimationFrame(() => callback());
    return () => view.cancelAnimationFrame(id);
}

/**
 * Resolves when every animation and transition running on the element has finished, or at once
 * when there is none (spec/dialog.md, "Animation": unmount after the exit animation).
 */
export async function waitForAnimations(element: Element): Promise<void> {
    const animations =
        typeof element.getAnimations === "function"
            ? element.getAnimations()
            : [];
    await Promise.allSettled(animations.map((animation) => animation.finished));
}

/**
 * Whether an animation or a transition runs on the element now (reading them applies its pending
 * styles): an exit with none ends at once, in the render that started it, never a painted frame
 * later (spec/collapsible.md and tabs.md, "Animation").
 */
export function isAnimating(element: Element): boolean {
    return (
        typeof element.getAnimations === "function" &&
        element.getAnimations().length > 0
    );
}
