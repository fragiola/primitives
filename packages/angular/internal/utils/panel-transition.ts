import {
    afterRenderEffect,
    computed,
    effect,
    linkedSignal,
    type Signal,
    signal,
    untracked,
} from "@angular/core";
import {
    freezePanelSize,
    nextFrame,
    type PanelSize,
    panelSizeVariables,
    waitForAnimations,
    watchBeforeMatch,
} from "@fragiola/primitives/presence";
import { conditionalView } from "./conditional-view.ts";
import { injectFlush } from "./flush.ts";
import type { TransitionStatus } from "./presence.ts";

export interface PanelOptions {
    /** Keep a closed panel in the DOM, `hidden` (default `false`). */
    keepMounted?: boolean;
    /** Keep a closed panel in the DOM, `hidden="until-found"`: find-in-page opens it. */
    hiddenUntilFound?: boolean;
}

/**
 * A disclosure panel's options from its structural directive's main input:
 * `*collapsiblePanel` alone gives `""` (none), `*collapsiblePanel="{ keepMounted: true }"` the
 * object.
 */
export function panelOptions(value: unknown): PanelOptions {
    return typeof value === "object" && value !== null
        ? (value as PanelOptions)
        : {};
}

export interface PanelTransitionOptions {
    open: Signal<boolean>;
    /** The size variables' prefix: `collapsible` gives `--collapsible-panel-height`. */
    prefix: string;
    options: Signal<PanelOptions>;
    /** The browser's find-in-page matched the closed panel's content: open it. */
    onFound: () => void;
}

export interface PanelTransition {
    /** The panel's element while it is rendered, else `null`. */
    element: Signal<HTMLElement | null>;
    status: Signal<TransitionStatus>;
    /** The `hidden` attribute's value: `""`, `"until-found"`, or `null` while shown. */
    hidden: Signal<string | null>;
    /** The size variables' values (`auto` at rest, pixels while a transition runs). */
    variables: Signal<Record<string, string>>;
}

/**
 * A disclosure panel's view and its open and close mechanics (spec/collapsible.md, "Animation"
 * and "Find in page"), shared by Collapsible and Accordion: the structural directive's view,
 * rendered while the panel is shown or exiting (always, when kept mounted), `data-starting-style`
 * and `data-ending-style`, and the size variables, a length while a transition runs and `auto` at
 * rest. A panel open on the first render, or opened by a find-in-page match, has no transition.
 * Created in a structural directive's injection context.
 *
 * Closing measures the panel before `data-ending-style` reaches the DOM: a plain `effect` runs
 * before the view is refreshed, so the element is still the open one when the size is frozen; the
 * ending status is set after it. The ends of the transitions are awaited after rendering
 * (`afterRenderEffect`), as `createPresence` does.
 */
export function createPanelTransition({
    open,
    prefix,
    options,
    onFound,
}: PanelTransitionOptions): PanelTransition {
    const flush = injectFlush();
    // a find-in-page match opens the panel at once, with no transition
    let skipTransition = false;
    // shown: open, or closing while its exit runs (the first render shows the first state)
    const shown = linkedSignal<boolean, boolean>({
        source: open,
        computation: (isOpen, previous) => isOpen || (previous?.value ?? false),
    });
    // `starting` in the same pass as the open state, so the first frame shown carries it
    const status = linkedSignal<boolean, TransitionStatus>({
        source: open,
        computation: (isOpen, previous) => {
            if (previous === undefined) {
                return undefined;
            }
            if (isOpen) {
                // reopened while closing: back from where it is to its size, with no start
                return skipTransition || previous.value === "ending"
                    ? undefined
                    : "starting";
            }
            // `ending` is set once the size is frozen
            return previous.value === "ending" ? "ending" : undefined;
        },
    });
    const size = signal<PanelSize | null>(null);
    const kept = computed(() => {
        const { keepMounted = false, hiddenUntilFound = false } = options();
        return keepMounted || hiddenUntilFound;
    });
    const element = conditionalView(computed(() => shown() || kept()));

    let actedOn: boolean | undefined;
    // whether the last close is still running its exit
    let exiting = false;
    effect(() => {
        const isOpen = open();
        untracked(() => {
            const previous = actedOn;
            actedOn = isOpen;
            if (previous === undefined || previous === isOpen) {
                return;
            }
            if (isOpen) {
                // the status reads the flags: computed before they are reset
                status();
                const node = element();
                if (skipTransition) {
                    skipTransition = false;
                    size.set(null);
                } else if (exiting && node !== null) {
                    // reopened while closing: back from where it is to its size, measured again
                    size.set(freezePanelSize(node, prefix));
                }
                exiting = false;
                return;
            }
            const node = element();
            if (node === null || node.hidden) {
                shown.set(false);
                status.set(undefined);
                size.set(null);
                return;
            }
            // the size in pixels, applied, before `data-ending-style`: the transition starts from it
            size.set(freezePanelSize(node, prefix));
            exiting = true;
            status.set("ending");
        });
    });

    // opening: measured with its starting style applied, which the next frame removes
    afterRenderEffect((onCleanup) => {
        const node = element();
        if (status() !== "starting" || node === null) {
            return;
        }
        untracked(() => {
            size.set(freezePanelSize(node, prefix));
            onCleanup(nextFrame(node, () => status.set(undefined)));
        });
    });

    // opened: back to `auto` once its transition ended
    afterRenderEffect((onCleanup) => {
        const node = element();
        if (
            !open() ||
            status() !== undefined ||
            size() === null ||
            node === null
        ) {
            return;
        }
        let cancelled = false;
        const cancelFrame = nextFrame(node, () => {
            void waitForAnimations(node).then(() => {
                if (!cancelled) {
                    size.set(null);
                }
            });
        });
        onCleanup(() => {
            cancelled = true;
            cancelFrame();
        });
    });

    // closing: unmounted (or hidden) once its transition ended
    afterRenderEffect((onCleanup) => {
        if (status() !== "ending") {
            return;
        }
        const node = untracked(element);
        let cancelled = false;
        const finish = () => {
            if (!cancelled) {
                exiting = false;
                shown.set(false);
                status.set(undefined);
                size.set(null);
            }
        };
        if (node === null) {
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
    });

    afterRenderEffect((onCleanup) => {
        const node = element();
        if (node === null || !options().hiddenUntilFound) {
            return;
        }
        onCleanup(
            watchBeforeMatch(node, {
                onMatch: () => {
                    skipTransition = true;
                    untracked(onFound);
                    // rendered within the event: the panel shows the match, open, before the
                    // toolkit checks a task later whether the app kept it closed
                    flush();
                },
                isOpen: () => {
                    const isOpen = untracked(open);
                    if (!isOpen) {
                        skipTransition = false;
                    }
                    return isOpen;
                },
            }),
        );
    });

    return {
        element,
        status,
        hidden: computed(() => {
            if (shown()) {
                return null;
            }
            return options().hiddenUntilFound ? "until-found" : "";
        }),
        variables: computed(() => panelSizeVariables(prefix, size())),
    };
}

/** Writes a panel's size variables on it (structural inline style). */
export function writeVariables(
    element: HTMLElement,
    variables: Record<string, string>,
): void {
    for (const [name, value] of Object.entries(variables)) {
        element.style.setProperty(name, value);
    }
}
