import type { Recipe } from "./recipe.ts";

// spec/label.md, "Anatomy": the text of a control's name; a Label wrapping its control lays it out
// in a row. Its text stays selectable by a drag (only a double press selects none, the Label's own
// behaviour).
export const label: Recipe<"root"> = {
    root: "inline-flex items-center gap-2 font-primitives text-(length:--pr-size) font-medium text-palette-contrast",
};
