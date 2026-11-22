import type { Recipe } from "./recipe.ts";
import { BUTTON } from "./shared.ts";

// spec/button.md, "Anatomy": the neutral button, dimmed while disabled (a focusable disabled
// button keeps its focus ring).
export const button: Recipe<"root"> = {
    root: `${BUTTON} cursor-default select-none data-disabled:cursor-not-allowed`,
};
