import {
    freezePanelSize,
    isAnimating,
    nextFrame,
    type PanelSize,
    panelSizeVariables,
    waitForAnimations,
    watchBeforeMatch,
} from "@fragiola/primitives/presence";
import { ref, shallowRef, watch } from "vue";
import { elementSetter } from "./use-overlay-root.ts";

export type PanelStatus = "starting" | "ending" | undefined;

export interface PanelTransitionOptions {
    open: () => boolean;
    /** The size variables' prefix: `collapsible` gives `--collapsible-panel-height`. */
    prefix: string;
    keepMounted: () => boolean;
    hiddenUntilFound: () => boolean;
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
    const element = shallowRef<HTMLElement | null>(null);
    // shown, or closing while its exit runs
    const mounted = ref(open());
    const status = ref<PanelStatus>(undefined);
    const size = shallowRef<PanelSize | null>(null);
    // a find-in-page match opens the panel at once, with no transition
    let skipTransition = false;

    // synchronous: a closing panel is measured while the DOM still shows it open, before
    // `data-ending-style` renders
    watch(
        open,
        (isOpen) => {
            const node = element.value;
            if (isOpen) {
                if (skipTransition) {
                    skipTransition = false;
                    mounted.value = true;
                    status.value = undefined;
                    size.value = null;
                } else if (status.value === "ending" && node !== null) {
                    // reopened while closing: back from where it is to its size
                    size.value = freezePanelSize(node, prefix);
                    status.value = undefined;
                } else {
                    mounted.value = true;
                    status.value = "starting";
                }
                return;
            }
            if (!mounted.value) {
                return;
            }
            // the size in pixels, applied, before `data-ending-style`: the transition starts from it
            if (node !== null) {
                size.value = freezePanelSize(node, prefix);
            }
            status.value = "ending";
        },
        { flush: "sync" },
    );

    // opening: measured with its starting style applied, which the next frame removes
    watch(
        () => [status.value, element.value] as const,
        ([current, node], _, onCleanup) => {
            if (current !== "starting" || node === null) {
                return;
            }
            size.value = freezePanelSize(node, prefix);
            onCleanup(
                nextFrame(node, () => {
                    status.value = undefined;
                }),
            );
        },
        { flush: "post" },
    );

    // opened: back to `auto` once its transition ended
    watch(
        () => [open(), status.value, size.value, element.value] as const,
        ([isOpen, current, frozen, node], _, onCleanup) => {
            if (!isOpen || current !== undefined || frozen === null || !node) {
                return;
            }
            let cancelled = false;
            const cancelFrame = nextFrame(node, () => {
                void waitForAnimations(node).then(() => {
                    if (!cancelled) {
                        size.value = null;
                    }
                });
            });
            onCleanup(() => {
                cancelled = true;
                cancelFrame();
            });
        },
        { flush: "post" },
    );

    // closing: unmounted (or hidden) once its transition ended
    watch(
        () => [status.value, element.value] as const,
        ([current, node], _, onCleanup) => {
            if (current !== "ending") {
                return;
            }
            let cancelled = false;
            const finish = () => {
                if (!cancelled) {
                    mounted.value = false;
                    status.value = undefined;
                    size.value = null;
                }
            };
            // nothing to animate: it ends in the same render, before a paint
            if (node === null || !isAnimating(node)) {
                finish();
                return;
            }
            const cancelFrame = nextFrame(node, () => {
                void waitForAnimations(node).then(finish);
            });
            onCleanup(() => {
                cancelled = true;
                cancelFrame();
            });
        },
        { flush: "post" },
    );

    watch(
        () => [element.value, hiddenUntilFound()] as const,
        ([node, untilFound], _, onCleanup) => {
            if (node === null || !untilFound) {
                return;
            }
            onCleanup(
                watchBeforeMatch(node, {
                    onMatch: () => {
                        skipTransition = true;
                        // the state is synchronous and the render follows in a microtask: the
                        // panel shows the match, open, before the toolkit checks a task later
                        // whether the app kept it closed
                        onFound();
                    },
                    isOpen: () => {
                        const isOpen = open();
                        if (!isOpen) {
                            skipTransition = false;
                        }
                        return isOpen;
                    },
                }),
            );
        },
        { flush: "post" },
    );

    const hidden = () => !open() && !mounted.value;
    return {
        setElement: elementSetter(element),
        /** Whether the panel is in the DOM. */
        rendered: () =>
            open() || mounted.value || keepMounted() || hiddenUntilFound(),
        /** The `hidden` attribute's value: `until-found`, `true`, or none. */
        hidden: (): "until-found" | true | undefined =>
            hidden() ? (hiddenUntilFound() ? "until-found" : true) : undefined,
        status: () => status.value,
        style: () => panelSizeVariables(prefix, size.value),
    };
}
