import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import type { ChangeDetails, ChangeReason } from "../utils/change-details.ts";
import { useControllableState } from "./use-controllable-state.ts";
import { usePresence } from "./use-presence.ts";

export interface OverlayRootProps {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, details: ChangeDetails) => void;
}

/**
 * The state every overlay root shares: open (controlled or not) with its last reason, the
 * trigger, positioner and popup elements, ids, and the presence of the popup (mounted while its
 * exit animation runs).
 *
 * `lastReason` is the reason of the change that made the current `open`: `null` when the
 * controlled `open` changed with no request of the overlay's own (a close the consumer made), so
 * a close never reuses an earlier change's reason for its focus return.
 */
export function useOverlayRoot(props: OverlayRootProps) {
    const [open, setOpenState] = useControllableState(
        props.open,
        props.defaultOpen ?? false,
        props.onOpenChange,
    );
    const [trigger, setTrigger] = useState<HTMLElement | null>(null);
    const [positioner, setPositioner] = useState<HTMLElement | null>(null);
    const [popup, setPopup] = useState<HTMLElement | null>(null);
    const lastReason = useRef<ChangeReason | null>(null);
    const requested = useRef<boolean | null>(null);
    const setOpen = useCallback(
        (next: boolean, reason: ChangeReason) => {
            lastReason.current = reason;
            requested.current = next;
            setOpenState(next, { reason });
            // a request the consumer turned down is forgotten once it is answered
            queueMicrotask(() => {
                requested.current = null;
            });
        },
        [setOpenState],
    );
    // before the popup's effects end its session (and read the reason)
    useLayoutEffect(() => {
        if (requested.current !== open) {
            lastReason.current = null;
        }
        requested.current = null;
    }, [open]);
    const presence = usePresence(open, () => popup);
    const baseId = useId();
    return {
        open,
        setOpen,
        lastReason,
        trigger,
        setTrigger,
        positioner,
        setPositioner,
        popup,
        setPopup,
        presence,
        triggerId: `${baseId}-trigger`,
        popupId: `${baseId}-popup`,
    };
}

export type OverlayRoot = ReturnType<typeof useOverlayRoot>;
