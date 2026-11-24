import type { Recipe } from "./recipe.ts";
import { FOCUS_RING } from "./shared.ts";

// spec/drop-zone.md, "Anatomy". A dashed box with whole-pixel sizes (pointer tests drop on it),
// its border solid and its background soft while files are dragged over it, dimmed while disabled.
export const dropZone: Recipe<"root"> = {
    root: `flex h-32 w-80 cursor-pointer items-center justify-center rounded-popup border-2 border-dashed border-palette-line bg-palette-base px-4 text-center font-primitives text-(length:--pr-size) text-palette-accent transition-colors duration-(--pr-motion) hover:bg-palette-soft data-drop-target:border-solid data-drop-target:border-palette-contrast data-drop-target:bg-palette-soft data-disabled:cursor-not-allowed data-disabled:opacity-50 ${FOCUS_RING}`,
};
