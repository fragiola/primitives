import {
    effect,
    type InputSignal,
    type OutputEmitterRef,
    type Signal,
    signal,
    untracked,
} from "@angular/core";
import type {
    ChangeDetails,
    ChangeReason,
    OpenChangeEvent,
} from "./change-details.ts";
import { controllable } from "./controllable.ts";
import { injectFlush } from "./flush.ts";
import { injectId } from "./inject-id.ts";
import { createPresence } from "./presence.ts";

/**
 * The state every overlay root shares: open (bound or its own) with its last reason, the trigger,
 * positioner and popup elements, ids, and the presence of the popup (mounted while its exit
 * animation runs). Created in a root directive's injection context. `setOpen` is called from
 * event handlers only, and renders the change at once (`injectFlush`).
 *
 * `lastReason` is the reason of the change that made the current `open`: `null` when the bound
 * `open` changed with no request of the overlay's own (a close the consumer made), so a close
 * never reuses an earlier change's reason for its focus return.
 */
export function createOverlayRoot(
    inputs: {
        open: Signal<boolean | undefined>;
        openChange: OutputEmitterRef<boolean>;
        defaultOpen: InputSignal<boolean>;
    },
    emit: (event: OpenChangeEvent) => void,
    prefix: string,
) {
    const state = controllable<boolean, ChangeDetails>(
        inputs.open,
        inputs.openChange,
        () => inputs.defaultOpen(),
        (open, details) => emit({ open, details }),
    );
    const trigger = signal<HTMLElement | null>(null);
    const positioner = signal<HTMLElement | null>(null);
    const popup = signal<HTMLElement | null>(null);
    const lastReason: { current: ChangeReason | null } = { current: null };
    let requested: boolean | null = null;
    // before rendering, so before the popup's after-render effects end its session
    effect(() => {
        const value = state.value();
        untracked(() => {
            if (requested !== value) {
                lastReason.current = null;
            }
            requested = null;
        });
    });
    const id = injectId(prefix);
    const flush = injectFlush();
    return {
        open: state.value,
        setOpen: (next: boolean, reason: ChangeReason) => {
            lastReason.current = reason;
            requested = next;
            state.set(next, { reason });
            // a request the consumer turned down is forgotten once it is answered
            queueMicrotask(() => {
                requested = null;
            });
            // the popup (and its focus) or the focus return, before the next event
            flush();
        },
        lastReason,
        trigger,
        positioner,
        popup,
        presence: createPresence(state.value, popup),
        triggerId: `${id}-trigger`,
        popupId: `${id}-popup`,
    };
}

export type OverlayRoot = ReturnType<typeof createOverlayRoot>;
