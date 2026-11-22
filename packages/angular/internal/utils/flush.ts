import { ApplicationRef, inject } from "@angular/core";

/**
 * Renders a state change at once, from an event handler (spec/menu.md, "Keyboard": a key that
 * opens or closes a level moves the focus before the next key arrives). React renders the state a
 * discrete event set before the next one; Angular's zoneless scheduler renders it in a later task,
 * after input that the browser already queued (two quick ArrowDown presses would both reach the
 * trigger). A change made during change detection (an overlay closed because the overlay it was
 * opened from closed, from that one's after-render cleanup) is rendered by the running pass, which
 * refreshes the views it marked: the nested tick is skipped.
 */
export function injectFlush(): () => void {
    const app = inject(ApplicationRef);
    return () => {
        try {
            app.tick();
        } catch (error) {
            // NG0101: `tick` called while a tick runs
            if ((error as { code?: number } | null)?.code !== 101) {
                throw error;
            }
        }
    };
}
