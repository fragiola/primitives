import type { Recipe } from "./recipe.ts";
import { BUTTON, PANEL_MOTION } from "./shared.ts";

// spec/collapsible.md, "Anatomy"
export const collapsible: Recipe<"root" | "trigger" | "panel"> = {
    root: "flex flex-col items-start gap-2 font-primitives text-(length:--pr-size) text-palette-contrast",
    trigger: `${BUTTON} data-panel-open:bg-palette-soft`,
    panel: `w-full h-(--collapsible-panel-height) ${PANEL_MOTION} *:py-1 text-palette-accent/85`,
};
