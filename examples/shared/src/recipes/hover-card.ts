import { popover } from "./popover.ts";
import type { Recipe } from "./recipe.ts";
import { FLOATING_BOX, FOCUS_RING } from "./shared.ts";

// spec/hover-card.md, "Anatomy": a link, and a card on Popover's floating box. A move to another
// trigger (data-instant) skips the enter transition.
export const hoverCard: Recipe<
    "trigger" | "backdrop" | "positioner" | "popup" | "arrow"
> = {
    trigger: `rounded-control font-medium text-palette-accent underline underline-offset-2 ${FOCUS_RING}`,
    backdrop:
        "fixed inset-0 bg-palette-contrast/10 transition-opacity duration-(--pr-motion) data-starting-style:opacity-0 data-ending-style:opacity-0",
    positioner: "z-50",
    popup: `${FLOATING_BOX} relative w-64 max-w-(--available-width) flex flex-col gap-1 p-4 outline-none data-instant:transition-none`,
    arrow: popover.arrow,
};
