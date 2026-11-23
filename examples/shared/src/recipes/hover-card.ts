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
    // the arrow's borders follow the side it ended up on (data-side), as the Popover's
    arrow: "size-2.5 rotate-45 bg-palette-base border-palette-line data-[side=bottom]:border-t data-[side=bottom]:border-s data-[side=top]:border-b data-[side=top]:border-e data-[side=left]:border-t data-[side=left]:border-e data-[side=right]:border-b data-[side=right]:border-s ltr:data-[side=inline-start]:border-t ltr:data-[side=inline-start]:border-e ltr:data-[side=inline-end]:border-b ltr:data-[side=inline-end]:border-s rtl:data-[side=inline-start]:border-b rtl:data-[side=inline-start]:border-s rtl:data-[side=inline-end]:border-t rtl:data-[side=inline-end]:border-e",
};
