import type { Recipe } from "./recipe.ts";
import { BUTTON, FOCUS_RING } from "./shared.ts";

// spec/breadcrumbs.md, "Anatomy". One row: the links quiet, the current page in the contrast
// colour, the separators dimmed; the Ellipsis a small square button.
export const breadcrumbs: Recipe<
    "root" | "list" | "item" | "link" | "current" | "separator" | "ellipsis"
> = {
    root: "font-primitives text-(length:--pr-size) text-palette-contrast",
    list: "flex flex-wrap items-center gap-2",
    item: "inline-flex items-center",
    link: `rounded-control text-palette-accent underline-offset-4 hover:text-palette-contrast hover:underline data-current:text-palette-contrast data-current:font-medium data-disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:hover:no-underline ${FOCUS_RING}`,
    current: "font-medium text-palette-contrast",
    separator: "text-palette-accent/70 select-none",
    ellipsis: `${BUTTON} h-6 min-w-6 px-1`,
};
