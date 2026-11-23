import type { Recipe } from "./recipe.ts";
import { FOCUS_RING } from "./shared.ts";

// spec/rating.md, "Anatomy". A row of stars: each Item holds an outlined star (`star`, in the line
// color) and a filled one over it (`fill`), shown whole while highlighted and cut to its
// inline-start half while half; `hidden-input` has no style (it is visually hidden).
export const rating: Recipe<"root" | "item" | "star" | "fill"> = {
    root: "flex items-center gap-1 font-primitives text-palette-contrast",
    item: `group relative inline-flex size-6 shrink-0 rounded-sm text-palette-line data-disabled:opacity-50 ${FOCUS_RING}`,
    star: "size-6 shrink-0 fill-current",
    fill: "absolute inset-y-0 start-0 flex w-0 overflow-hidden text-palette-contrast group-[[data-highlighted]:not([data-half])]:w-full group-data-half:w-1/2",
};
