import type { OpenChangeDetails } from "@fragiola/primitives-react/dialog";
import { useState } from "react";

/**
 * What every lifecycle scenario prints and does (spec/README.md, "The lifecycle scenarios"): the
 * open state that happened, the last reason, `onOpenChangeComplete`'s last value, and, with
 * `?cancel`, the reason of the last close it canceled.
 */
export function useLifecycle(cancel: boolean | undefined) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string>();
    const [complete, setComplete] = useState<boolean>();
    const [canceled, setCanceled] = useState<string>();
    return {
        values: { open, reason, complete, canceled },
        onOpenChange: (next: boolean, details: OpenChangeDetails) => {
            setReason(details.reason);
            if (cancel === true && !next) {
                details.cancel();
                setCanceled(details.reason);
                return;
            }
            setOpen(next);
        },
        onOpenChangeComplete: (next: boolean) => setComplete(next),
    };
}
