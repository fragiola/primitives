import type { Recipe } from "./recipe.ts";

// spec/toggle-group.md, "Anatomy": a row of toggles, a column when vertical (`data-orientation`,
// its own or its Toolbar's), dimmed while disabled.
export const toggleGroup: Recipe<"root"> = {
    root: "inline-flex items-center gap-1 font-primitives text-(length:--pr-size) text-palette-contrast data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch data-disabled:opacity-50",
};
