import { HoverCardArrow } from "./hover-card-arrow.tsx";
import { HoverCardBackdrop } from "./hover-card-backdrop.tsx";
import { createHoverCardHandle } from "./hover-card-handle.ts";
import { HoverCardPopup } from "./hover-card-popup.tsx";
import { HoverCardPortal } from "./hover-card-portal.tsx";
import { HoverCardPositioner } from "./hover-card-positioner.tsx";
import { HoverCardRoot } from "./hover-card-root.tsx";
import { HoverCardTrigger } from "./hover-card-trigger.tsx";

/** spec/hover-card.md */
export const HoverCard = {
    Root: HoverCardRoot,
    Trigger: HoverCardTrigger,
    Portal: HoverCardPortal,
    Backdrop: HoverCardBackdrop,
    Positioner: HoverCardPositioner,
    Popup: HoverCardPopup,
    Arrow: HoverCardArrow,
    createHandle: createHoverCardHandle,
};
