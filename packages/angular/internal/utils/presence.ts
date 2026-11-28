import {
    afterRenderEffect,
    computed,
    linkedSignal,
    type Signal,
    untracked,
} from "@angular/core";
import {
    isAnimating,
    nextFrame,
    waitForAnimations,
} from "@fragiola/primitives/presence";
import { injectFlush } from "./flush.ts";

export type TransitionStatus = "starting" | "ending" | undefined;

export interface Presence {
    /** Whether the element is rendered: open, or closing while its exit animation runs. */
    mounted: Signal<boolean>;
    status: Signal<TransitionStatus>;
    /** Keeps the next exit running until `finish()` (a close's `preventUnmountOnClose()`). */
    hold: () => void;
    /** Ends a running exit now (the root's `unmount()`). */
    finish: () => void;
}

export interface PresenceOptions {
    /** Whether an element open on the first render starts with `data-starting-style` (`true`). */
    enterOnMount?: boolean;
    /**
     * Called once an opening's starting frame ended and its animations finished (`true`), and once
     * an exit's animations finished (`false`); never on the first render, nor for an exit a
     * reopening interrupted (spec/README.md, "Lifecycle").
     */
    onComplete?: (open: boolean) => void;
}

/**
 * Keeps an element mounted while its exit animation runs (spec/dialog.md, "Animation"):
 * `data-starting-style` for the first frame after mounting, `data-ending-style` until every
 * animation on the element has finished. The status derives from `open` in the same pass, so the
 * element's first render (or a kept-mounted element shown again) already carries
 * `data-starting-style`; the effect only clears it.
 *
 * The effect runs after rendering (`afterRenderEffect`), as React's and Vue's post-render effects:
 * the exit is awaited once the element carries `data-ending-style`, so its transition has started.
 * A plain `effect` runs before the view is refreshed, finds no animation, and unmounts at once.
 * An exit that waited for its animations is rendered at once when they end (`ApplicationRef.tick()`),
 * before the browser paints that frame. Call it in an injection context.
 */
export function createPresence(
    open: Signal<boolean>,
    element: Signal<HTMLElement | null>,
    options: PresenceOptions = {},
): Presence {
    const status = linkedSignal<boolean, TransitionStatus>({
        source: open,
        computation: (isOpen, previous) => {
            if (isOpen) {
                // the first render's state already shows itself, unless it enters on mount
                return previous === undefined && options.enterOnMount === false
                    ? undefined
                    : "starting";
            }
            const wasShown =
                previous !== undefined &&
                (previous.source || previous.value === "ending");
            return wasShown ? "ending" : undefined;
        },
    });
    // the open state last acted on (the first render's state already shows the first one), the
    // change of `open` each transition belongs to (a newer one cancels an older one's end), an
    // opening whose enter has to report its end, and an exit held until `finish()`
    let actedOn: boolean | undefined;
    let epoch = 0;
    let entering = false;
    let held = false;
    const flush = injectFlush();

    const finish = () => {
        if (untracked(status) !== "ending") {
            return;
        }
        held = false;
        epoch += 1;
        status.set(undefined);
        options.onComplete?.(false);
    };

    afterRenderEffect((onCleanup) => {
        const isOpen = open();
        const current = status();
        const node = element();
        if (actedOn === undefined) {
            actedOn = isOpen;
        } else if (isOpen !== actedOn) {
            actedOn = isOpen;
            epoch += 1;
            entering = isOpen;
            if (isOpen) {
                held = false;
            }
        }
        if (current === "starting") {
            if (node) {
                onCleanup(nextFrame(node, () => status.set(undefined)));
            }
            return;
        }
        if (current === undefined) {
            if (entering && isOpen) {
                // the enter transition started once `data-starting-style` was removed
                entering = false;
                const at = epoch;
                const report = () => {
                    if (epoch === at && untracked(open)) {
                        options.onComplete?.(true);
                    }
                };
                if (node) {
                    void waitForAnimations(node).then(report);
                } else {
                    report();
                }
            }
            return;
        }
        if (held) {
            return;
        }
        let cancelled = false;
        const at = epoch;
        const end = (): boolean => {
            if (cancelled || epoch !== at || held) {
                return false;
            }
            finish();
            return true;
        };
        // nothing to animate: it ends in the same render, before a paint
        if (node && isAnimating(node)) {
            void waitForAnimations(node).then(() => {
                if (!end()) {
                    return;
                }
                // rendered in the microtask of the animation's end: the zoneless scheduler's
                // later render can come after that frame's paint, which shows a keyframe exit
                // back at its resting style (spec/README.md, "Lifecycle")
                flush();
            });
        } else {
            end();
        }
        onCleanup(() => {
            cancelled = true;
        });
    });
    return {
        mounted: computed(() => open() || status() === "ending"),
        status,
        hold: () => {
            held = true;
        },
        finish,
    };
}
