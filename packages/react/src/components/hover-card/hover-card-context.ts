import type { Align, Side } from "@fragiola/primitives/positioning";
import { createContext } from "react";
import type { OverlayRoot } from "../../hooks/use-overlay-root.ts";
import type { ChangeReason } from "../../utils/change-details.ts";

export interface HoverCardContextValue extends OverlayRoot {
    /** Opens now, from `trigger` (default: the active one); `instant` when no delay ran. */
    show: (
        reason: ChangeReason,
        instant: boolean,
        event?: Event,
        trigger?: HTMLElement | null,
    ) => void;
    hide: (reason: ChangeReason, event?: Event) => void;
    /** A trigger's hover or keyboard focus: starts the delay (or moves an open card at once). */
    intentStart: (
        reason: "trigger-hover" | "trigger-focus",
        trigger: HTMLElement,
        event: Event,
    ) => void;
    hoverEnd: (trigger: HTMLElement) => void;
    /** A trigger's blur: closes the card unless focus went into it. */
    blur: (trigger: HTMLElement, event: FocusEvent) => void;
    instant: boolean;
    arrow: HTMLElement | null;
    setArrow: (element: HTMLElement | null) => void;
    placed: { side: Side; align: Align };
    setPlaced: (placed: { side: Side; align: Align }) => void;
}

export const HoverCardContext = createContext<HoverCardContextValue | null>(
    null,
);
