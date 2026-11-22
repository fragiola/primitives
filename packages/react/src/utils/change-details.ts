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
    | "clear-press"
    | "chip-remove-press"
    | "trigger-hover"
    | "trigger-focus"
    | "keyboard"
    | "track-press"
    | "drag"
    | "swipe"
    | "imperative-action"
    | "none";

/** What a change reports besides its value (spec/README.md, "Change details"). */
export interface ChangeDetails {
    reason: ChangeReason;
    /** The DOM event that caused it, when known; `undefined` when programmatic. */
    event?: Event | undefined;
}

/** What an overlay's `onOpenChange` reports (spec/README.md, "Open change details"). */
export interface OpenChangeDetails extends ChangeDetails {
    /** The DOM event that caused it; `undefined` when programmatic. */
    event: Event | undefined;
    /** The trigger the change is associated with: the pressed one, else the active one. */
    trigger: HTMLElement | undefined;
    /** Called inside `onOpenChange`: the change does not happen. */
    cancel: () => void;
    readonly isCanceled: boolean;
    /** A close: the popup stays mounted (`data-ending-style`) until the actions' `unmount()`. */
    preventUnmountOnClose: () => void;
}

/** An overlay's imperative actions (`actionsRef`, spec/README.md, "Lifecycle"). */
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

/** An element to focus: an element, a ref to one, or `false` for none. */
export type FocusTarget =
    | HTMLElement
    | { current: HTMLElement | null }
    | false
    | null
    | undefined;

export function resolveFocusTarget(
    target: FocusTarget,
): HTMLElement | null | false {
    if (target === false) {
        return false;
    }
    if (target == null) {
        return null;
    }
    return target instanceof HTMLElement ? target : target.current;
}
