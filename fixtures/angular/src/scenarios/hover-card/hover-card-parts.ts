import {
    HoverCardArrow,
    HoverCardBackdrop,
    HoverCardPopup,
    HoverCardPortal,
    HoverCardPositioner,
    HoverCardRoot,
    HoverCardTrigger,
} from "@fragiola/primitives-angular/hover-card";

/** Every HoverCard directive, for a scenario's `imports`. */
export const HOVER_CARD_PARTS = [
    HoverCardRoot,
    HoverCardTrigger,
    HoverCardPortal,
    HoverCardBackdrop,
    HoverCardPositioner,
    HoverCardPopup,
    HoverCardArrow,
] as const;
