import { ElementRef } from "@angular/core";

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

/** What an overlay's open change reports (spec/README.md, "Open change details"). */
export interface OpenChangeDetails extends ChangeDetails {
    /** The DOM event that caused it; `undefined` when programmatic. */
    event: Event | undefined;
    /** The trigger the change is associated with: the pressed one, else the active one. */
    trigger: HTMLElement | undefined;
    /** Called while `(openChangeDetails)` is handled: the change does not happen. */
    cancel(): void;
    readonly isCanceled: boolean;
    /** A close: the popup stays mounted (`data-ending-style`) until the root's `unmount()`. */
    preventUnmountOnClose(): void;
}

/** An overlay's imperative actions: public methods of its root directive (spec/README.md, "Lifecycle"). */
export interface OverlayActions {
    /** Closes the overlay (reason `imperative-action`). */
    close(): void;
    /** Ends a running exit now, or the exit held by `preventUnmountOnClose()`. */
    unmount(): void;
}

/**
 * What `(openChangeDetails)` emits: the new open state and why. An overlay emits it before the
 * state changes, with its `OpenChangeDetails` (`details.cancel()` keeps the state as it is;
 * `(openChange)` then emits nothing); a disclosure (Collapsible) with `ChangeDetails`.
 */
export interface OpenChangeEvent<
    Details extends ChangeDetails = OpenChangeDetails,
> {
    open: boolean;
    details: Details;
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

/** What `(valueChangeDetails)` emits: the new value and why it changed. */
export interface ValueChangeEvent<T> {
    value: T;
    details: ChangeDetails;
}

/**
 * An element to focus: an element (a template reference variable on it), an `ElementRef`, a
 * getter read when the focus moves, or `false` for none.
 */
export type FocusTarget =
    | HTMLElement
    | ElementRef<HTMLElement>
    | (() => HTMLElement | null)
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
    if (target instanceof ElementRef) {
        return target.nativeElement;
    }
    return typeof target === "function" ? target() : target;
}
