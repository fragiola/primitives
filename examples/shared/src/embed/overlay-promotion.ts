// Adapted from Fragiola UI (fragiola/ui, examples/react/src/host/overlay-promotion.ts), same
// author and licence: there it keys off the registry's `data-slot` names and React; here it is
// framework-free and keys off the primitives' part attribute, so every framework's embed host
// runs the same module (guidelines decisions.md#np-modal-overlays).
//
// Overlay promotion, the embed's half (site export contract v1.7, §5.4). A modal overlay (a
// dialog, an alert dialog or a drawer) belongs over the site's whole page, so the site
// promotes the frame over its viewport while one is open, and the stage is pinned where it was:
// the reader sees nothing move but the overlay. The copyable example files never know about it.
//
//   host      the site can promote. Nothing is intercepted before it: a site older than v1.3
//             never answers, and overlays open in place.
//   click     a modal trigger is pressed (mouse, touch or keyboard: a button's activation is a
//             click). The click is stopped in the capture phase on the window, before any
//             framework sees it, `overlay` open is sent, and the click is played again on the same
//             trigger once the frame is `promoted`: the overlay mounts in the viewport it ends in,
//             so its opening animation is never cut nor moved. No `promoted` in time: the click is
//             played anyway, in place.
//   promote   arm: a stylesheet under a media query of the promoted viewport pins the stage to
//             `rect` and clears the root's background. It matches in the same rendering update as
//             the frame's new size, never a message later, and stops matching by itself once the
//             frame is back in place. Then `armed`.
//   promoted  release the held click. Sent again on a resize: re-arm.
//   closed    the last modal popup has left the DOM. The primitives unmount a popup only once its
//             exit animation has ended (`data-ending-style`, then presence), so the frame goes
//             back only after the overlay has fully closed.
//
// An overlay opened from code, with no trigger, is caught when its popup mounts and asks then:
// its first frames may play in place.

import {
    ARMED,
    HOST,
    holdResize,
    OVERLAY,
    PROMOTE,
    PROMOTED,
    post,
} from "./messages.ts";

/** The parts that open a modal overlay (`data-primitives-part`). */
export const MODAL_TRIGGER_PARTS = [
    "dialog-trigger",
    "alert-dialog-trigger",
    "drawer-trigger",
] as const;
/** The parts that exist while a modal overlay is open or closing. */
export const MODAL_POPUP_PARTS = [
    "dialog-popup",
    "alert-dialog-popup",
    "drawer-popup",
] as const;
/** The embed's stage, which the armed rule pins in place. */
export const STAGE_SELECTOR = "[data-embed-stage]";

const partSelector = (parts: readonly string[]) =>
    parts.map((part) => `[data-primitives-part="${part}"]`).join(", ");
const MODAL_TRIGGERS = partSelector(MODAL_TRIGGER_PARTS);
const MODAL_POPUPS = partSelector(MODAL_POPUP_PARTS);

/** How long a held click waits for `promoted` before it opens in place. */
export const HOLD_TIMEOUT_MS = 300;
/** How long a played click may take to mount a modal popup. */
export const MOUNT_TIMEOUT_MS = 300;

export interface PromotionGeometry {
    rect: { x: number; y: number; width: number; height: number };
    viewport: { width: number; height: number };
}

/**
 * The armed rule: only in the promoted viewport, the stage sits where the inline frame was,
 * painting the page's base under the example, and nothing else of the document paints but the
 * overlays.
 */
export function armedRule({ rect, viewport }: PromotionGeometry): string {
    return `@media (width: ${viewport.width}px) and (height: ${viewport.height}px) {
    html, body { background: transparent; }
    ${STAGE_SELECTOR} {
        position: fixed;
        left: ${rect.x}px;
        top: ${rect.y}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        margin: 0;
        overflow: hidden;
        background-color: var(--palette-base);
    }
}`;
}

export type HostMessage =
    | { type: typeof HOST; overlay: true }
    | ({ type: typeof PROMOTE | typeof PROMOTED } & PromotionGeometry);

const finite = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value);

/** Whether `data` is one of the site's promotion messages, well formed. */
export function isHostMessage(data: unknown): data is HostMessage {
    if (typeof data !== "object" || data === null) return false;
    const message = data as Record<string, unknown>;
    if (message.type === HOST) return message.overlay === true;
    if (message.type !== PROMOTE && message.type !== PROMOTED) return false;
    const rect = message.rect as Record<string, unknown> | undefined;
    const viewport = message.viewport as Record<string, unknown> | undefined;
    return (
        !!rect &&
        !!viewport &&
        [rect.x, rect.y, rect.width, rect.height].every(finite) &&
        [viewport.width, viewport.height].every(finite)
    );
}

/** The modal trigger a click landed on, if any. */
export function modalTriggerOf(target: EventTarget | null): HTMLElement | null {
    return target instanceof Element
        ? target.closest<HTMLElement>(MODAL_TRIGGERS)
        : null;
}

/** Whether a modal overlay of `doc` is open or still closing. */
export function modalOpen(doc: Document): boolean {
    return doc.querySelector(MODAL_POPUPS) !== null;
}

/**
 * Starts overlay promotion for the example `id`; a no-op outside a frame. Returns a cleanup (the
 * embeds never call it: the example lives as long as the page).
 */
export function promoteOverlays(id: string): () => void {
    if (window.parent === window) return () => {};

    let hosted = false;
    /** `overlay` open was sent and `overlay` closed not yet */
    let asked = false;
    /** the click waiting for `promoted` */
    let held: (() => void) | null = null;
    let replaying = false;
    /** a played click whose popup may not have mounted yet */
    let settling = false;
    let armed: HTMLStyleElement | undefined;
    /** the viewport the rule was armed for */
    let armedFor: PromotionGeometry["viewport"] | undefined;

    const arm = (geometry: PromotionGeometry) => {
        armed ??= document.head.appendChild(document.createElement("style"));
        armed.dataset.armed = "";
        armed.textContent = armedRule(geometry);
        armedFor = geometry.viewport;
    };

    // Back in place, the rule no longer matches; it is dropped as soon as the frame leaves the
    // promoted size, so an inline frame that later happens to have that very size is never pinned
    // to a stale `rect`.
    const onResize = () => {
        if (!armed || !armedFor || asked) return;
        if (
            window.innerWidth === armedFor.width &&
            window.innerHeight === armedFor.height
        ) {
            return;
        }
        armed.textContent = "";
        armedFor = undefined;
    };

    const close = () => {
        if (!asked) return;
        asked = false;
        held = null;
        post({ type: OVERLAY, id, open: false });
        holdResize(false);
    };

    const ask = (release: () => void) => {
        asked = true;
        held = release;
        holdResize(true);
        post({ type: OVERLAY, id, open: true });
        setTimeout(() => {
            if (held !== release) return;
            held = null;
            release();
        }, HOLD_TIMEOUT_MS);
    };

    const replay = (trigger: HTMLElement) => {
        replaying = true;
        settling = true;
        try {
            trigger.click();
        } finally {
            replaying = false;
        }
        // a trigger that opened nothing (disabled meanwhile) must not leave the frame promoted
        setTimeout(() => {
            settling = false;
            if (!modalOpen(document)) close();
        }, MOUNT_TIMEOUT_MS);
    };

    const onMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.source !== window.parent) return;
        if (!isHostMessage(event.data)) return;
        const data = event.data;
        if (data.type === HOST) {
            hosted = true;
        } else if (data.type === PROMOTE) {
            arm(data);
            post({ type: ARMED, id });
        } else {
            arm(data);
            const release = held;
            held = null;
            release?.();
        }
    };

    // Capture on the window: before React's root listener and before Vue's and Angular's
    // listeners on the trigger itself, so the primitive never sees the first click.
    const onClick = (event: MouseEvent) => {
        if (!hosted || replaying) return;
        const trigger = modalTriggerOf(event.target);
        if (!trigger) return;
        const stop = () => {
            event.stopImmediatePropagation();
            event.preventDefault();
        };
        // a second click while the first waits (a double click) would open the overlay in place:
        // the held click opens it
        if (held) return stop();
        // already promoted (an overlay opening another), or one is still closing: it opens where
        // it is
        if (asked || modalOpen(document)) return;
        stop();
        ask(() => replay(trigger));
    };

    // Every framework's portal appends the popup to <body> (or a container inside it).
    const observer = new MutationObserver(() => {
        if (!hosted) return;
        const open = modalOpen(document);
        if (open) settling = false;
        if (open && !asked) ask(() => {});
        else if (!open && asked && !held && !settling) close();
    });

    window.addEventListener("resize", onResize);
    window.addEventListener("message", onMessage);
    window.addEventListener("click", onClick, { capture: true });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("message", onMessage);
        window.removeEventListener("click", onClick, { capture: true });
        observer.disconnect();
        armed?.remove();
    };
}
