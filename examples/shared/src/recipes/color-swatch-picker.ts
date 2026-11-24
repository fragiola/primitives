import type { Recipe } from "./recipe.ts";

// spec/color-swatch-picker.md, "Scenarios". A grid of four 32 px columns, 8 px apart (whole
// pixels, as the scenarios' rows expect); the selected swatch ringed, the focused one outlined.
export const colorSwatchPicker: Recipe<"root" | "item"> = {
    root: "grid w-fit grid-cols-[repeat(4,2rem)] gap-2 data-disabled:opacity-50",
    item: "size-8 rounded-control outline-hidden data-selected:ring-2 data-selected:ring-palette-contrast data-selected:ring-offset-2 data-selected:ring-offset-palette-base data-disabled:opacity-40 focus-visible:outline-solid focus-visible:outline-(length:--pr-focus-width) focus-visible:outline-offset-4 focus-visible:outline-palette-ring",
};
