import type { Recipe } from "./recipe.ts";
import { BUTTON } from "./shared.ts";

// spec/toggle.md, "Anatomy": the neutral button, filled while pressed (`data-pressed`), dimmed
// while disabled.
export const toggle: Recipe<"root"> = {
    root: `${BUTTON} cursor-default select-none data-pressed:border-palette-contrast data-pressed:bg-palette-contrast data-pressed:text-palette-base data-pressed:hover:bg-palette-contrast data-disabled:cursor-not-allowed`,
};
