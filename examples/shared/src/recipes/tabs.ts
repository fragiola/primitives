// Adapted from the POC (@poc/styles, src/recipes/tabs.ts).
import type { Recipe } from "./recipe.ts";
import { FOCUS_RING } from "./shared.ts";

// spec/tabs.md, "Anatomy"
export const tabs: Recipe<"root" | "list" | "tab" | "indicator" | "panel"> = {
    root: "flex flex-col gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast data-[orientation=vertical]:flex-row",
    list: "relative flex gap-1 border-b border-palette-line data-[orientation=vertical]:flex-col data-[orientation=vertical]:border-b-0 data-[orientation=vertical]:border-e",
    tab: `h-(--pr-control-height) px-3 font-medium text-palette-accent/85 rounded-control transition-colors duration-(--pr-motion) hover:text-palette-contrast data-selected:text-palette-contrast data-disabled:opacity-50 ${FOCUS_RING}`,
    indicator:
        "absolute start-(--tabs-indicator-inset-inline-start) bottom-0 h-(--pr-indicator-size) w-(--tabs-indicator-inline-size) bg-palette-ring transition-[inset-inline-start,width] duration-(--pr-motion) data-[orientation=vertical]:start-auto data-[orientation=vertical]:end-0 data-[orientation=vertical]:bottom-auto data-[orientation=vertical]:top-(--tabs-indicator-inset-block-start) data-[orientation=vertical]:h-(--tabs-indicator-block-size) data-[orientation=vertical]:w-(--pr-indicator-size)",
    panel: `${FOCUS_RING} rounded-control`,
};
