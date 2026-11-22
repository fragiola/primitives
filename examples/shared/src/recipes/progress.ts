import type { Recipe } from "./recipe.ts";

// spec/progress.md, "Anatomy". The Label and the Value share a row over the Track; the Indicator
// is placed by its structural style (`inset-inline-start`, `inline-size`) and only drawn here.
// Indeterminate, it is a still third of the Track: no endless animation, so a page always
// settles (a recipe may animate it from `data-indeterminate`).
export const progress: Recipe<
    "root" | "label" | "value" | "track" | "indicator"
> = {
    root: "flex w-64 flex-wrap items-center justify-between gap-y-1 font-primitives text-(length:--pr-size) text-palette-contrast",
    label: "font-medium text-palette-contrast",
    value: "tabular-nums text-palette-accent",
    track: "relative h-2 basis-full overflow-hidden rounded-full bg-palette-soft",
    indicator:
        "absolute inset-y-0 rounded-full bg-palette-contrast transition-[inline-size] duration-(--pr-motion) data-indeterminate:start-0 data-indeterminate:w-1/3 data-indeterminate:opacity-60",
};
