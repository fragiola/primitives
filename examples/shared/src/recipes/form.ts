import type { Recipe } from "./recipe.ts";

// spec/form.md, "Anatomy": the form lays its fields out in a column.
export const form: Recipe<"root"> = {
    root: "flex flex-col items-start gap-4 font-primitives text-(length:--pr-size) text-palette-contrast",
};
