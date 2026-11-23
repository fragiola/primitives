import type { OpenChangeDetails } from "@fragiola/primitives-react/menu";
import { useState } from "react";

/** The open menu's name, the last reason and the last clicked item a menubar scenario prints. */
export function useMenubarOutput() {
    const [menu, setMenu] = useState<string>();
    const [reason, setReason] = useState<string>();
    const [action, setAction] = useState<string>();
    return {
        values: { menu, reason, action },
        onOpenChange:
            (name: string) => (open: boolean, details: OpenChangeDetails) => {
                setMenu((current) =>
                    open ? name : current === name ? undefined : current,
                );
                setReason(details.reason);
            },
        select: (label: string) => () => setAction(label),
    };
}
