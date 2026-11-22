import type { Recipe } from "./recipe.ts";

// spec/fieldset.md, "Anatomy". Palette roles only: a bordered group whose legend dims while it is
// disabled (its fields dim themselves, through the Field recipe).
export const fieldset: Recipe<"root" | "legend"> = {
    root: "m-0 flex min-w-0 flex-col items-start gap-3 rounded-control border border-palette-line p-4 font-primitives text-(length:--pr-size) text-palette-contrast",
    legend: "font-medium text-palette-contrast data-disabled:opacity-50",
};
