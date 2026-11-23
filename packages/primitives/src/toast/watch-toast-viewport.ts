import type { ToastManager, ToastObject } from "./toast-manager.ts";

/** What a Viewport's watch reports and needs (spec/toast.md, "Viewport"). */
export interface ToastViewportWatch {
    /** Moves focus off a toast that is closing (`root`): to the next toast, else the previous, else back. */
    focusAfterClose(root: HTMLElement): void;
    /** Removes every listener and the live regions. */
    stop(): void;
}

export interface ToastViewportWatchOptions {
    /** The stack expands while the pointer is over it or the keyboard is in it. */
    onExpandedChange: (expanded: boolean) => void;
}

const ROOT = '[data-primitives-part="toast-root"]';

/** Styles that keep an element in the accessibility tree and off the screen. */
const VISUALLY_HIDDEN =
    "position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap";

function isFocusVisible(element: Element): boolean {
    try {
        return element.matches(":focus-visible");
    } catch {
        return true;
    }
}

/**
 * Watches a toast Viewport (spec/toast.md, "Viewport", "Announcements", "Pausing"): the F6
 * landmark (F6 focuses the viewport, F6 or Shift+Tab from it go back where focus was), the
 * pauses (the pointer over it, the keyboard in it, a hidden page), and the announcements: two
 * live regions inside it, polite and assertive, that hold the title and description of every
 * shown toast by its priority, inserted in the order they show. It holds no component state:
 * the queue (`manager`) holds the toasts, the component the expanded state it reports.
 */
export function watchToastViewport<Data>(
    viewport: HTMLElement,
    manager: ToastManager<Data>,
    options: ToastViewportWatchOptions,
): ToastViewportWatch {
    const doc = viewport.ownerDocument;
    let previous: HTMLElement | null = null;
    let hovering = false;
    let focused = false;
    let expanded = false;
    let leaving = false;

    const report = () => {
        const next = hovering || focused;
        if (next !== expanded) {
            expanded = next;
            options.onExpandedChange(next);
        }
    };

    // the live regions: in the page before any toast, so a screen reader follows them
    const region = (live: "polite" | "assertive") => {
        const element = doc.createElement("div");
        element.setAttribute("data-primitives-part", "toast-announcer");
        element.setAttribute(
            "data-priority",
            live === "polite" ? "low" : "high",
        );
        element.setAttribute("aria-live", live);
        element.setAttribute("aria-atomic", "false");
        element.setAttribute("aria-relevant", "additions text");
        element.setAttribute("style", VISUALLY_HIDDEN);
        return element;
    };
    const polite = region("polite");
    const assertive = region("assertive");
    viewport.prepend(polite, assertive);
    const announced = new Map<string, HTMLElement>();

    const announce = (toasts: readonly ToastObject<Data>[]) => {
        const shown = new Map(
            toasts
                .filter((toast) => !toast.closing && !toast.limited)
                .map((toast) => [toast.id, toast]),
        );
        for (const [id, element] of announced) {
            const toast = shown.get(id);
            const target = toast?.priority === "high" ? assertive : polite;
            if (toast === undefined || element.parentElement !== target) {
                element.remove();
                announced.delete(id);
            }
        }
        // the oldest first: a newer toast is inserted after the ones already announced
        for (const toast of [...shown.values()].reverse()) {
            const text = [toast.title, toast.description]
                .filter((part) => part !== undefined && part !== "")
                .join(" ");
            let element = announced.get(toast.id);
            if (element === undefined) {
                element = doc.createElement("div");
                element.setAttribute(
                    "data-primitives-part",
                    "toast-announcement",
                );
                element.textContent = text;
                (toast.priority === "high" ? assertive : polite).append(
                    element,
                );
                announced.set(toast.id, element);
            } else if (element.textContent !== text) {
                element.textContent = text;
            }
        }
    };

    const restoreFocus = () => {
        const target = previous;
        previous = null;
        if (target?.isConnected && target !== doc.body) {
            target.focus({ preventScroll: true });
            return;
        }
        const active = doc.activeElement;
        if (active instanceof HTMLElement && viewport.contains(active)) {
            active.blur();
        }
    };

    const hasToasts = () => manager.toasts().some((toast) => !toast.closing);

    const settleLeave = () => {
        // the stack stays expanded under the pointer while a toast's exit runs
        if (!leaving || manager.toasts().some((toast) => toast.closing)) {
            return;
        }
        leaving = false;
        hovering = false;
        manager.resume("hover");
        report();
    };

    const unsubscribe = manager.subscribe(() => {
        const toasts = manager.toasts();
        announce(toasts);
        if (toasts.length === 0) {
            leaving = false;
            hovering = false;
            focused = false;
            manager.resume("hover");
            manager.resume("focus");
            report();
            return;
        }
        settleLeave();
    });

    const onPointerEnter = (event: PointerEvent) => {
        if (event.pointerType === "touch") {
            return;
        }
        leaving = false;
        hovering = true;
        manager.pause("hover");
        report();
    };
    const onPointerLeave = (event: PointerEvent) => {
        if (event.pointerType === "touch" || !hovering) {
            return;
        }
        leaving = true;
        settleLeave();
    };
    const onFocusIn = (event: FocusEvent) => {
        const target = event.target;
        if (
            focused ||
            !(target instanceof Element) ||
            !(target === viewport || isFocusVisible(target))
        ) {
            return;
        }
        focused = true;
        manager.pause("focus");
        report();
    };
    const onFocusOut = (event: FocusEvent) => {
        const next = event.relatedTarget;
        if (!focused || (next instanceof Node && viewport.contains(next))) {
            return;
        }
        focused = false;
        manager.resume("focus");
        report();
    };
    const onViewportKeyDown = (event: KeyboardEvent) => {
        if (event.defaultPrevented || previous === null) {
            return;
        }
        if (
            event.key === "F6" ||
            (event.key === "Tab" && event.shiftKey && event.target === viewport)
        ) {
            event.preventDefault();
            event.stopPropagation();
            restoreFocus();
        }
    };
    const onDocumentKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "F6" || event.defaultPrevented || !hasToasts()) {
            return;
        }
        const active = doc.activeElement;
        if (active instanceof Node && viewport.contains(active)) {
            return;
        }
        event.preventDefault();
        previous = active instanceof HTMLElement ? active : null;
        viewport.focus({ preventScroll: true });
    };
    const onVisibility = () => {
        if (doc.visibilityState === "hidden") {
            manager.pause("hidden");
        } else {
            manager.resume("hidden");
        }
    };

    viewport.addEventListener("pointerenter", onPointerEnter);
    viewport.addEventListener("pointerleave", onPointerLeave);
    viewport.addEventListener("focusin", onFocusIn);
    viewport.addEventListener("focusout", onFocusOut);
    viewport.addEventListener("keydown", onViewportKeyDown);
    doc.addEventListener("keydown", onDocumentKeyDown);
    doc.addEventListener("visibilitychange", onVisibility);
    onVisibility();
    announce(manager.toasts());

    return {
        focusAfterClose(root) {
            const active = doc.activeElement;
            if (
                !(active instanceof Element) ||
                !root.contains(active) ||
                !isFocusVisible(active)
            ) {
                return;
            }
            const roots = [
                ...viewport.querySelectorAll<HTMLElement>(ROOT),
            ].filter(
                (element) =>
                    element === root ||
                    (!element.hasAttribute("data-ending-style") &&
                        !element.hasAttribute("data-limited") &&
                        !element.inert),
            );
            const index = roots.indexOf(root);
            const next = roots[index + 1] ?? roots[index - 1];
            if (next !== undefined && next !== root) {
                next.focus();
            } else {
                restoreFocus();
            }
        },
        stop() {
            unsubscribe();
            viewport.removeEventListener("pointerenter", onPointerEnter);
            viewport.removeEventListener("pointerleave", onPointerLeave);
            viewport.removeEventListener("focusin", onFocusIn);
            viewport.removeEventListener("focusout", onFocusOut);
            viewport.removeEventListener("keydown", onViewportKeyDown);
            doc.removeEventListener("keydown", onDocumentKeyDown);
            doc.removeEventListener("visibilitychange", onVisibility);
            polite.remove();
            assertive.remove();
            manager.resume("hover");
            manager.resume("focus");
            manager.resume("hidden");
        },
    };
}
