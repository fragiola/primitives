import type { Recipe } from "./recipe.ts";
import { FOCUS_RING } from "./shared.ts";

// spec/search-field.md, "Anatomy". One bordered box (ringed while the focus is inside) with a
// search icon, the Input (the browser's own cancel button hidden) and the ClearButton at its
// inline end, invisible while the field is empty; the invalid border of a Field.
export const searchField: Recipe<"root" | "icon" | "input" | "clear-button"> = {
    root: "inline-flex h-(--pr-control-height) w-64 items-center gap-2 rounded-control border border-palette-line bg-palette-base ps-3 font-primitives text-(length:--pr-size) text-palette-contrast focus-within:outline-solid focus-within:outline-(length:--pr-focus-width) focus-within:outline-offset-2 focus-within:outline-palette-ring data-disabled:opacity-50 has-[[aria-invalid=true]]:border-2 has-[[aria-invalid=true]]:border-palette-contrast",
    icon: "size-4 shrink-0 text-palette-accent",
    input: "h-full min-w-0 flex-1 bg-transparent text-palette-contrast outline-hidden placeholder:text-palette-accent [&::-webkit-search-cancel-button]:appearance-none",
    "clear-button": `inline-flex h-full w-(--pr-control-height) shrink-0 items-center justify-center rounded-e-control text-palette-accent hover:bg-palette-soft disabled:opacity-50 data-empty:invisible ${FOCUS_RING}`,
};
