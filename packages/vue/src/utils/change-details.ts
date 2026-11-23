/** Why a value or an open state changed (spec/README.md, "Change details"). */
export type ChangeReason =
    | "trigger-press"
    | "close-press"
    | "escape-key"
    | "outside-press"
    | "focus-out"
    | "item-press"
    | "list-navigation"
    | "input-change"
    | "input-press"
    | "input-clear"
    | "input-blur"
    | "input-paste"
    | "clear-press"
    | "chip-remove-press"
    | "trigger-hover"
    | "trigger-focus"
    | "keyboard"
    | "increment-press"
    | "decrement-press"
    | "wheel"
    | "scrub"
    | "track-press"
    | "drag"
    | "swipe"
    | "previous-press"
    | "next-press"
    | "first-press"
    | "last-press"
    | "imperative-action"
    | "none";

/** What a change reports besides its value (spec/README.md, "Change details"). */
export interface ChangeDetails {
    reason: ChangeReason;
    /** The DOM event that caused it, when known; `undefined` when programmatic. */
    event?: Event | undefined;
}

/** What an overlay's `open-change` reports (spec/README.md, "Open change details"). */
export interface OpenChangeDetails extends ChangeDetails {
    /** The DOM event that caused it; `undefined` when programmatic. */
    event: Event | undefined;
    /** The trigger the change is associated with: the pressed one, else the active one. */
    trigger: HTMLElement | undefined;
    /** Called inside the `open-change` listener: the change does not happen. */
    cancel: () => void;
    readonly isCanceled: boolean;
    /** A close: the popup stays mounted (`data-ending-style`) until the Root's `unmount()`. */
    preventUnmountOnClose: () => void;
}

/** An overlay's imperative actions, exposed by its Root (spec/README.md, "Lifecycle"). */
export interface OverlayActions {
    /** Closes the overlay (reason `imperative-action`). */
    close: () => void;
    /** Ends a running exit now, or the exit held by `preventUnmountOnClose()`. */
    unmount: () => void;
}

/** The details of one open change; `held` tells whether `preventUnmountOnClose()` was called. */
export function createOpenChangeDetails(
    reason: ChangeReason,
    event: Event | undefined,
    trigger: HTMLElement | undefined,
): { details: OpenChangeDetails; held: () => boolean } {
    let canceled = false;
    let held = false;
    const details: OpenChangeDetails = {
        reason,
        event,
        trigger,
        cancel: () => {
            canceled = true;
        },
        get isCanceled() {
            return canceled;
        },
        preventUnmountOnClose: () => {
            held = true;
        },
    };
    return { details, held: () => held };
}

/**
 * An element to focus: an element, a component instance (its root element), a template ref
 * holding either, a getter of any of them, or `false` for none.
 *
 * A template auto-unwraps a ref, so `:initial-focus="cancel"` passes its value at render time,
 * before the element exists when it is inside the popup. A getter (`:initial-focus="() =>
 * cancel"`) is read when the focus moves, after the content mounted.
 */
export type FocusTarget =
    | HTMLElement
    | object
    | (() => unknown)
    | false
    | null
    | undefined;

export function resolveFocusTarget(
    target: FocusTarget,
): HTMLElement | null | false {
    if (typeof target === "function") {
        return resolveFocusTarget(target() as FocusTarget);
    }
    if (target === false) {
        return false;
    }
    if (target == null) {
        return null;
    }
    const direct = toElement(target);
    if (direct !== null) {
        return direct;
    }
    return "value" in target
        ? toElement((target as { value: unknown }).value)
        : null;
}

/** The element behind a template ref: the element itself, or a component's root element. */
export function toElement(value: unknown): HTMLElement | null {
    if (value === null || typeof value !== "object") {
        return null;
    }
    if ((value as { nodeType?: unknown }).nodeType === 1) {
        return value as HTMLElement;
    }
    const root = (value as { $el?: unknown }).$el;
    return root !== null &&
        typeof root === "object" &&
        (root as { nodeType?: unknown }).nodeType === 1
        ? (root as HTMLElement)
        : null;
}
