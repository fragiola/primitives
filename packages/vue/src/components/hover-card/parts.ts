import { HoverCardArrow } from "./hover-card-arrow.ts";
import { HoverCardBackdrop } from "./hover-card-backdrop.ts";
import { createHoverCardHandle } from "./hover-card-handle.ts";
import { HoverCardPopup } from "./hover-card-popup.ts";
import { HoverCardPortal } from "./hover-card-portal.ts";
import { HoverCardPositioner } from "./hover-card-positioner.ts";
import { HoverCardRoot } from "./hover-card-root.ts";
import { HoverCardTrigger } from "./hover-card-trigger.ts";

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
