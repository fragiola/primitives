import { createDelayGroup } from "@fragiola/primitives/hover";
import { type ReactNode, useMemo, useRef, useState } from "react";
import { TooltipProviderContext } from "./tooltip-context.ts";

export interface TooltipProviderProps {
    /** ms before a hovered trigger opens its tooltip. */
    delay?: number;
    /** ms before a tooltip closes once the pointer left. */
    closeDelay?: number;
    /** ms after a close during which another tooltip of the group opens at once. */
    timeout?: number;
    children?: ReactNode;
}

/** A delay group: shared delays and the instant hand-off (spec/tooltip.md). */
export function TooltipProvider({
    delay = 600,
    closeDelay = 0,
    timeout = 400,
    children,
}: TooltipProviderProps) {
    // one group for the provider's life, reading the current timeout: a change of a prop never
    // leaves the open member in a group of its own
    const timeoutRef = useRef(timeout);
    timeoutRef.current = timeout;
    const [group] = useState(() =>
        createDelayGroup({ timeout: () => timeoutRef.current }),
    );
    const value = useMemo(
        () => ({ delay, closeDelay, group }),
        [delay, closeDelay, group],
    );
    return (
        <TooltipProviderContext.Provider value={value}>
            {children}
        </TooltipProviderContext.Provider>
    );
}
