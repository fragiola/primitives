import {
    isAnimating,
    nextFrame,
    waitForAnimations,
} from "@fragiola/primitives/presence";
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { flushSync } from "react-dom";

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
 */
export function usePresence(
    open: boolean,
    element: () => HTMLElement | null,
    options: PresenceOptions = {},
) {
    const [mounted, setMounted] = useState(open);
    const [status, setStatus] = useState<TransitionStatus>(
        open && options.enterOnMount !== false ? "starting" : undefined,
    );
    // the open state last rendered: a change sets the transition in the render that makes it, so
    // an element shown again (kept mounted) is never committed without `data-starting-style`
    const [rendered, setRendered] = useState(open);
    if (rendered !== open) {
        setRendered(open);
        if (open) {
            setMounted(true);
            setStatus("starting");
        } else if (mounted) {
            setStatus("ending");
        }
    }
    // the open state last acted on: the first render's state already shows the first one
    const actedOn = useRef(open);
    const onComplete = useRef(options.onComplete);
    onComplete.current = options.onComplete;
    const openRef = useRef(open);
    openRef.current = open;

    const mountedRef = useRef(mounted);
    mountedRef.current = mounted;
    // the change of `open` each transition belongs to: a newer one cancels an older one's end
    const epoch = useRef(0);
    // an opening whose enter has to report its end
    const entering = useRef(false);
    // the running exit waits for `finish()` (`preventUnmountOnClose()`)
    const held = useRef(false);
    const statusRef = useRef(status);
    statusRef.current = status;

    const finish = useCallback(() => {
        if (statusRef.current !== "ending") {
            return;
        }
        statusRef.current = undefined;
        held.current = false;
        epoch.current += 1;
        setMounted(false);
        setStatus(undefined);
        onComplete.current?.(false);
    }, []);
    const hold = useCallback(() => {
        held.current = true;
    }, []);

    useLayoutEffect(() => {
        if (open === actedOn.current) {
            return;
        }
        actedOn.current = open;
        epoch.current += 1;
        if (open) {
            held.current = false;
            entering.current = true;
        } else {
            entering.current = false;
            if (!mountedRef.current) {
                held.current = false;
            }
        }
    }, [open]);

    // the element of this render: a popup mounted in the render that starts its transition is
    // known one render later, which runs the effects again
    const node = element();

    // an exit with nothing to animate ends in the same render, before the browser paints it
    useLayoutEffect(() => {
        if (
            status === "ending" &&
            !held.current &&
            (node === null || !isAnimating(node))
        ) {
            finish();
        }
    }, [status, node, finish]);

    useEffect(() => {
        if (status === "starting" && node) {
            return nextFrame(node, () => setStatus(undefined));
        }
        if (status === undefined && entering.current && openRef.current) {
            // the enter transition started once `data-starting-style` was removed
            entering.current = false;
            const at = epoch.current;
            const report = () => {
                if (epoch.current === at && openRef.current) {
                    onComplete.current?.(true);
                }
            };
            if (node) {
                void waitForAnimations(node).then(report);
            } else {
                report();
            }
            return undefined;
        }
        if (status === "ending" && node && !held.current) {
            const at = epoch.current;
            void waitForAnimations(node).then(() => {
                if (epoch.current === at && !held.current) {
                    // committed now, in the microtask of the animation's end: a commit after the
                    // next paint would show a keyframe exit back at its resting style for a frame
                    // (spec/README.md, "Lifecycle"; Base UI's `useAnimationsFinished`)
                    flushSync(finish);
                }
            });
        }
        return undefined;
    }, [status, node, finish]);

    return { mounted: open || mounted, status, hold, finish };
}
