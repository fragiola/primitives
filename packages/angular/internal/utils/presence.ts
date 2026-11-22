import {
    afterRenderEffect,
    computed,
    linkedSignal,
    type Signal,
} from "@angular/core";
import { nextFrame, waitForAnimations } from "@fragiola/primitives/presence";

export type TransitionStatus = "starting" | "ending" | undefined;

export interface Presence {
    /** Whether the element is rendered: open, or closing while its exit animation runs. */
    mounted: Signal<boolean>;
    status: Signal<TransitionStatus>;
}

/**
 * Keeps an element mounted while its exit animation runs (spec/dialog.md, "Animation"):
 * `data-starting-style` for the first frame after mounting, `data-ending-style` until every
 * animation on the element has finished. The status derives from `open` in the same pass, so the
 * element's first render already carries `data-starting-style`; the effect only clears it.
 *
 * The effect runs after rendering (`afterRenderEffect`), as React's and Vue's post-render effects:
 * the exit is awaited once the element carries `data-ending-style`, so its transition has started.
 * A plain `effect` runs before the view is refreshed, finds no animation, and unmounts at once.
 */
export function createPresence(
    open: Signal<boolean>,
    element: Signal<HTMLElement | null>,
    options: {
        /** Whether an element open on the first render starts with `data-starting-style` (`true`). */
        enterOnMount?: boolean;
    } = {},
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
    afterRenderEffect((onCleanup) => {
        const current = status();
        const node = element();
        if (current === "starting" && node) {
            onCleanup(nextFrame(node, () => status.set(undefined)));
            return;
        }
        if (current !== "ending") {
            return;
        }
        let cancelled = false;
        const finish = () => {
            if (!cancelled) {
                status.set(undefined);
            }
        };
        if (node) {
            void waitForAnimations(node).then(finish);
        } else {
            finish();
        }
        onCleanup(() => {
            cancelled = true;
        });
    });
    return {
        mounted: computed(() => open() || status() === "ending"),
        status,
    };
}
