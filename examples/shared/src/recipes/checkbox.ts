// Adapted from the POC (@poc/styles, src/recipes/checkbox.ts).
import type { Recipe } from "./recipe.ts";
import { FOCUS_RING } from "./shared.ts";

// spec/checkbox.md, "Anatomy"
export const checkbox: Recipe<"root" | "indicator"> = {
    root: `inline-flex size-4 shrink-0 items-center justify-center rounded-[min(var(--pr-radius),4px)] border border-palette-line bg-palette-base text-palette-base transition-colors duration-(--pr-motion) data-checked:border-palette-contrast data-checked:bg-palette-contrast data-indeterminate:border-palette-contrast data-indeterminate:bg-palette-contrast data-invalid:border-palette-contrast data-disabled:opacity-50 ${FOCUS_RING}`,
    indicator: "flex items-center justify-center text-xs leading-none",
};

// spec/checkbox.md, "Anatomy" (CheckboxGroup)
export const checkboxGroup: Recipe<"root"> = {
    root: "flex flex-col items-start gap-2 font-primitives text-(length:--pr-size) text-palette-contrast",
};
