import {
    freezePanelSize,
    isAnimating,
    nextFrame,
    type PanelSize,
    panelSizeVariables,
    waitForAnimations,
    watchBeforeMatch,
} from "@fragiola/primitives/presence";
import {
    type CSSProperties,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { flushSync } from "react-dom";
import { useElement } from "./use-element.ts";

export type PanelStatus = "starting" | "ending" | undefined;

export interface PanelTransitionOptions {
    open: boolean;
    /** The size variables' prefix: `collapsible` gives `--collapsible-panel-height`. */
    prefix: string;
    keepMounted: boolean;
    hiddenUntilFound: boolean;
    /** The browser's find-in-page matched the closed panel's content: open it. */
    onFound: () => void;
}

/**
 * A disclosure panel's open and close mechanics (spec/collapsible.md, "Animation" and "Find in
 * page"), shared by Collapsible and Accordion: `data-starting-style` and `data-ending-style`
 * through the toolkit's presence, and the size variables, a length while a transition runs and
 * `auto` at rest. A panel open on the first render has no transition.
 */
export function usePanelTransition({
    open,
    prefix,
    keepMounted,
    hiddenUntilFound,
    onFound,
}: PanelTransitionOptions) {
    const [element, ref] = useElement<HTMLElement>();
    // shown, or closing while its exit runs
    const [mounted, setMounted] = useState(open);
    const [status, setStatus] = useState<PanelStatus>(undefined);
    const [size, setSize] = useState<PanelSize | null>(null);
    const latest = useRef({ open, element, status, mounted, onFound });
    latest.current = { open, element, status, mounted, onFound };
    const shownOpen = useRef(open);
    // a find-in-page match opens the panel at once, with no transition
    const skipTransition = useRef(false);

    useLayoutEffect(() => {
        if (open === shownOpen.current) {
            return;
        }
        shownOpen.current = open;
        const {
            element: node,
            status: current,
            mounted: shown,
        } = latest.current;
        if (open) {
            if (skipTransition.current) {
                skipTransition.current = false;
                setMounted(true);
                setStatus(undefined);
                setSize(null);
            } else if (current === "ending" && node !== null) {
                // reopened while closing: back from where it is to its size
                setSize(freezePanelSize(node, prefix));
                setStatus(undefined);
            } else {
                setMounted(true);
                setStatus("starting");
            }
            return;
        }
        if (!shown) {
            return;
        }
        // the size in pixels, applied, before `data-ending-style`: the transition starts from it
        if (node !== null) {
            setSize(freezePanelSize(node, prefix));
        }
        setStatus("ending");
    }, [open, prefix]);

    // opening: measured with its starting style applied, which the next frame removes
    useLayoutEffect(() => {
        if (status !== "starting" || element === null) {
            return undefined;
        }
        setSize(freezePanelSize(element, prefix));
        return nextFrame(element, () => setStatus(undefined));
    }, [status, element, prefix]);

    // opened: back to `auto` once its transition ended
    useEffect(() => {
        if (
            !open ||
            status !== undefined ||
            size === null ||
            element === null
        ) {
            return undefined;
        }
        let cancelled = false;
        const cancelFrame = nextFrame(element, () => {
            void waitForAnimations(element).then(() => {
                if (!cancelled) {
                    setSize(null);
                }
            });
        });
        return () => {
            cancelled = true;
            cancelFrame();
        };
    }, [open, status, size, element]);

    // closing with nothing to animate: unmounted (or hidden) in the same render, before a paint
    useLayoutEffect(() => {
        if (status === "ending" && element !== null && !isAnimating(element)) {
            setMounted(false);
            setStatus(undefined);
            setSize(null);
        }
    }, [status, element]);

    // closing: unmounted (or hidden) once its transition ended
    useEffect(() => {
        if (status !== "ending") {
            return undefined;
        }
        let cancelled = false;
        const finish = () => {
            if (!cancelled) {
                setMounted(false);
                setStatus(undefined);
                setSize(null);
            }
        };
        if (element === null) {
            finish();
            return undefined;
        }
        const cancelFrame = nextFrame(element, () => {
            // committed in the microtask of the transition's end, before that frame is painted
            // (spec/README.md, "Lifecycle")
            void waitForAnimations(element).then(() => {
                if (!cancelled) {
                    flushSync(finish);
                }
            });
        });
        return () => {
            cancelled = true;
            cancelFrame();
        };
    }, [status, element]);

    const hidden = !open && !mounted;
    // React renders `hidden` as a boolean: the `until-found` value is written once mounted
    useLayoutEffect(() => {
        if (element !== null && hiddenUntilFound && hidden) {
            element.setAttribute("hidden", "until-found");
        }
    }, [element, hiddenUntilFound, hidden]);

    useEffect(() => {
        if (element === null || !hiddenUntilFound) {
            return undefined;
        }
        return watchBeforeMatch(element, {
            onMatch: () => {
                skipTransition.current = true;
                // rendered within the event: the panel shows the match, open, before the toolkit
                // checks a task later whether the app kept it closed
                flushSync(() => latest.current.onFound());
            },
            isOpen: () => {
                const isOpen = latest.current.open;
                if (!isOpen) {
                    skipTransition.current = false;
                }
                return isOpen;
            },
        });
    }, [element, hiddenUntilFound]);

    return {
        ref,
        /** Whether the panel is in the DOM. */
        rendered: open || mounted || keepMounted || hiddenUntilFound,
        hidden,
        status,
        style: panelSizeVariables(prefix, size) as CSSProperties,
    };
}
