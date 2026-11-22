// Adapted from the POC (@poc/styles, src/recipes/tooltip.ts).
import type { Recipe } from "./recipe.ts";
import { BUTTON } from "./shared.ts";

// spec/tooltip.md, "Anatomy". A hand-off (data-instant) skips the enter transition.
export const tooltip: Recipe<"trigger" | "positioner" | "popup" | "arrow"> = {
    trigger: BUTTON,
    positioner: "z-50",
    popup: "relative rounded-control bg-palette-contrast px-2 py-1 font-primitives text-xs text-palette-base shadow-popup origin-(--transform-origin) transition-[opacity,scale] duration-(--pr-motion) data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-instant:transition-none",
    arrow: "size-2 rotate-45 bg-palette-contrast",
};
