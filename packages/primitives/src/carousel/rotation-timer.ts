export interface RotationTimer {
    /** Starts the delay again from its whole length; `onElapse` runs once it passed. */
    start: (delay: number, onElapse: () => void) => void;
    /** Holds the running delay, keeping the time it has left. */
    pause: () => void;
    /** Runs a held delay on for the time it had left. */
    resume: () => void;
    /** Clears the delay. */
    stop: () => void;
}

/**
 * The delay of a carousel's rotation (spec/carousel.md, "The rotation"), on `element`'s window
 * timers: it decides nothing, the framework starts it on every page while playing, and pauses it
 * while a hover pauses the rotation, which resumes with the time it had left (Toast's pause rule).
 */
export function createRotationTimer(element: Element): RotationTimer {
    const view = element.ownerDocument.defaultView;
    let handle: number | undefined;
    let callback: (() => void) | null = null;
    let remaining = 0;
    let startedAt = 0;
    let paused = false;
    const now = () => view?.performance.now() ?? 0;
    const clear = () => {
        if (handle !== undefined) {
            view?.clearTimeout(handle);
            handle = undefined;
        }
    };
    const run = () => {
        clear();
        const elapse = callback;
        if (view === null || elapse === null) {
            return;
        }
        startedAt = now();
        handle = view.setTimeout(() => {
            handle = undefined;
            callback = null;
            elapse();
        }, remaining);
    };
    return {
        start(delay, onElapse) {
            callback = onElapse;
            remaining = Math.max(0, delay);
            if (paused) {
                clear();
            } else {
                run();
            }
        },
        pause() {
            if (paused) {
                return;
            }
            paused = true;
            if (handle !== undefined) {
                remaining = Math.max(0, remaining - (now() - startedAt));
                clear();
            }
        },
        resume() {
            if (!paused) {
                return;
            }
            paused = false;
            run();
        },
        stop() {
            clear();
            callback = null;
        },
    };
}
