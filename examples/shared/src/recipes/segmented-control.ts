import type { Recipe } from "./recipe.ts";
import { FOCUS_RING } from "./shared.ts";

// spec/segmented-control.md, "Anatomy". A soft track of equal segments; the Indicator, a raised
// tile over the checked segment's whole box from its variables, slides along it. It comes after
// the Items (its script measures them before hydration), so it is painted under them: the Root
// isolates a stacking context and the Indicator's `z-index` is negative.
export const segmentedControl: Recipe<
    "root" | "item" | "item-text" | "indicator"
> = {
    root: "relative isolate flex w-80 gap-1 rounded-control border border-palette-line bg-palette-soft p-1 font-primitives text-(length:--pr-size) text-palette-contrast data-[orientation=vertical]:w-40 data-[orientation=vertical]:flex-col",
    item: `relative h-(--pr-control-height) flex-1 rounded-control data-[orientation=vertical]:flex-none px-3 font-medium text-palette-accent/85 transition-colors duration-(--pr-motion) hover:text-palette-contrast data-checked:text-palette-contrast data-disabled:pointer-events-none data-disabled:opacity-50 ${FOCUS_RING}`,
    "item-text": "truncate",
    indicator:
        "absolute -z-1 start-(--segment-indicator-inset-inline-start) top-(--segment-indicator-inset-block-start) h-(--segment-indicator-block-size) w-(--segment-indicator-inline-size) rounded-control border border-palette-line bg-palette-base transition-[inset-inline-start,top,width,height] duration-(--pr-motion) data-disabled:opacity-50",
};
