import {
    isAnimating,
    nextFrame,
    waitForAnimations,
} from "@fragiola/primitives/presence";
import { type Ref, ref, watch } from "vue";

export type TransitionStatus = "starting" | "ending" | undefined;

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
 * animation on the element has finished. `hold()` keeps the next exit running until `finish()`
 * (a close's `preventUnmountOnClose()`); `finish()` ends a running exit at once.
 *
 * The transition is set in the change of `open` itself (a synchronous watcher), so an element
 * shown again (kept mounted) is never rendered open without `data-starting-style`.
 */
export function usePresence(
    open: Ref<boolean>,
    element: () => HTMLElement | null,
    options: PresenceOptions = {},
) {
    const mounted = ref(open.value);
    const status = ref<TransitionStatus>(
        open.value && options.enterOnMount !== false ? "starting" : undefined,
    );
    // the change of `open` each transition belongs to: a newer one cancels an older one's end
    let epoch = 0;
    // an opening whose enter has to report its end
    let entering = false;
    // the running exit waits for `finish()` (`preventUnmountOnClose()`)
    let held = false;

    const finish = () => {
        if (status.value !== "ending") {
            return;
        }
        held = false;
        epoch += 1;
        mounted.value = false;
        status.value = undefined;
        options.onComplete?.(false);
    };
    const hold = () => {
        held = true;
    };

    watch(
        open,
        (isOpen) => {
            epoch += 1;
            if (isOpen) {
                held = false;
                entering = true;
                mounted.value = true;
                status.value = "starting";
            } else {
                entering = false;
                if (mounted.value) {
                    status.value = "ending";
                } else {
                    held = false;
                }
            }
        },
        { flush: "sync" },
    );
    watch(
        () => [status.value, element()] as const,
        ([current, node], _, onCleanup) => {
            if (current === "starting") {
                if (node) {
                    onCleanup(
                        nextFrame(node, () => {
                            status.value = undefined;
                        }),
                    );
                }
                return;
            }
            if (current === undefined && entering && open.value) {
                // the enter transition started once `data-starting-style` was removed
                entering = false;
                const at = epoch;
                const report = () => {
                    if (epoch === at && open.value) {
                        options.onComplete?.(true);
                    }
                };
                if (node) {
                    void waitForAnimations(node).then(report);
                } else {
                    report();
                }
                return;
            }
            if (current === "ending" && !held) {
                // an exit with nothing to animate ends in the same flush, before a paint
                if (node === null || !isAnimating(node)) {
                    finish();
                    return;
                }
                const at = epoch;
                void waitForAnimations(node).then(() => {
                    if (epoch === at && !held) {
                        finish();
                    }
                });
            }
        },
        { flush: "post" },
    );
    return { mounted, status, hold, finish };
}
