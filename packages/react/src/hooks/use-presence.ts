import {
    isAnimating,
    nextFrame,
    waitForAnimations,
} from "@fragiola/primitives/presence";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export type TransitionStatus = "starting" | "ending" | undefined;

/**
 * Keeps an element mounted while its exit animation runs (spec/dialog.md, "Animation"):
 * `data-starting-style` for the first frame after mounting, `data-ending-style` until every
 * animation on the element has finished.
 */
export function usePresence(
    open: boolean,
    element: () => HTMLElement | null,
    options: {
        /** Whether an element open on the first render starts with `data-starting-style` (`true`). */
        enterOnMount?: boolean;
    } = {},
) {
    const [mounted, setMounted] = useState(open);
    const [status, setStatus] = useState<TransitionStatus>(
        open && options.enterOnMount !== false ? "starting" : undefined,
    );
    // the open state last acted on: the first render's state already shows the first one
    const actedOn = useRef(open);
    const elementRef = useRef(element);
    elementRef.current = element;

    const mountedRef = useRef(mounted);
    mountedRef.current = mounted;

    useLayoutEffect(() => {
        if (open === actedOn.current) {
            return;
        }
        actedOn.current = open;
        if (open) {
            setMounted(true);
            setStatus("starting");
        } else if (mountedRef.current) {
            setStatus("ending");
        }
    }, [open]);

    // an exit with nothing to animate ends in the same render, before the browser paints it
    useLayoutEffect(() => {
        const node = elementRef.current();
        if (status === "ending" && node && !isAnimating(node)) {
            setMounted(false);
            setStatus(undefined);
        }
    }, [status]);

    useEffect(() => {
        const node = elementRef.current();
        if (status === "starting" && node) {
            return nextFrame(node, () => setStatus(undefined));
        }
        if (status === "ending") {
            let cancelled = false;
            const finish = () => {
                if (!cancelled) {
                    setMounted(false);
                    setStatus(undefined);
                }
            };
            if (node) {
                void waitForAnimations(node).then(finish);
            } else {
                finish();
            }
            return () => {
                cancelled = true;
            };
        }
        return undefined;
    }, [status]);

    return { mounted: open || mounted, status };
}
