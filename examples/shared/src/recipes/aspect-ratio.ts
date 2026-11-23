import type { Recipe } from "./recipe.ts";

// spec/aspect-ratio.md, "Anatomy". The box clips its content and rounds its corners; its ratio is
// its structural style.
export const aspectRatio: Recipe<"root"> = {
    root: "w-full overflow-hidden rounded-popup bg-palette-soft",
};
