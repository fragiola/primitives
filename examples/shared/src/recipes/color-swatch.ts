import type { Recipe } from "./recipe.ts";

// spec/color-swatch.md, "State attributes and ARIA". A 32 px tile of the color (its CSS variable)
// over a checkerboard, so a transparent color shows it.
export const colorSwatch: Recipe<"root"> = {
    root: "size-8 shrink-0 rounded-control border border-palette-line [background:linear-gradient(var(--color-swatch-color),var(--color-swatch-color)),repeating-conic-gradient(#d4d4d8_0%_25%,#ffffff_0%_50%)_50%/12px_12px]",
};
