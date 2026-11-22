// Adapted from the POC (@poc/styles, src/recipes/popover.ts).
import type { Recipe } from "./recipe.ts";
import { BUTTON, FLOATING_BOX, FOCUS_RING } from "./shared.ts";

// spec/popover.md, "Anatomy". The arrow's borders follow the side it ended up on (data-side).
export const popover: Recipe<
    | "trigger"
    | "positioner"
    | "popup"
    | "arrow"
    | "title"
    | "description"
    | "close"
> = {
    trigger: `${BUTTON} data-popup-open:bg-palette-soft`,
    positioner: "z-50",
    popup: `${FLOATING_BOX} relative w-72 max-w-(--available-width) flex flex-col gap-2 p-4 ${FOCUS_RING}`,
    arrow: "size-2.5 rotate-45 bg-palette-base border-palette-line data-[side=bottom]:border-t data-[side=bottom]:border-s data-[side=top]:border-b data-[side=top]:border-e data-[side=left]:border-t data-[side=left]:border-e data-[side=right]:border-b data-[side=right]:border-s ltr:data-[side=inline-start]:border-t ltr:data-[side=inline-start]:border-e ltr:data-[side=inline-end]:border-b ltr:data-[side=inline-end]:border-s rtl:data-[side=inline-start]:border-b rtl:data-[side=inline-start]:border-s rtl:data-[side=inline-end]:border-t rtl:data-[side=inline-end]:border-e",
    title: "text-[1.1em] font-semibold",
    description: "text-palette-accent/85",
    close: BUTTON,
};
