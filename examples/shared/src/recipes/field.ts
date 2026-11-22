// Adapted from the POC (@poc/styles, src/recipes/field.ts).
import type { Recipe } from "./recipe.ts";
import { FOCUS_RING } from "./shared.ts";

// spec/field.md, "Anatomy". Palette roles only: an invalid control gets a heavier border in the
// contrast role, and its error is set in a medium weight.
export const field: Recipe<
    "root" | "label" | "control" | "description" | "error"
> = {
    root: "flex flex-col items-start gap-1 font-primitives text-(length:--pr-size) text-palette-contrast",
    label: "font-medium text-palette-contrast data-disabled:opacity-50",
    control: `h-(--pr-control-height) w-56 px-3 rounded-control border border-palette-line bg-palette-base text-palette-contrast data-invalid:border-2 data-invalid:border-palette-contrast data-disabled:opacity-50 ${FOCUS_RING}`,
    description: "text-xs text-palette-accent",
    error: "text-xs font-medium text-palette-contrast",
};
