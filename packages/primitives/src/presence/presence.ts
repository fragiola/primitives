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
 * when there is none (spec/dialog.md, "Animation": unmount after the exit animation). One that
 * starts while it waits (a property changed mid-exit cancels the running one, whose `finished`
 * rejects) is awaited too. It resolves in the microtask of the last one's `finished`, before that
 * frame is painted (spec/README.md, "Lifecycle").
 */
export async function waitForAnimations(element: Element): Promise<void> {
    for (;;) {
        // neither finished nor canceled (a finished one filling forwards is still listed)
        const running = (element.getAnimations?.() ?? []).filter(
            (animation) =>
                animation.playState !== "finished" &&
                animation.playState !== "idle",
        );
        if (running.length === 0) {
            return;
        }
        await Promise.allSettled(
            running.map((animation) => animation.finished),
        );
    }
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
