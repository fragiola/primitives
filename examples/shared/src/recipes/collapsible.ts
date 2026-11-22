import type { Recipe } from "./recipe.ts";
import { BUTTON } from "./shared.ts";

/**
 * A disclosure panel's height transition (spec/collapsible.md, "Animation"), with its height the
 * size variable (a length while it opens and closes, `auto` at rest) and 0 in the starting and
 * ending styles. No padding on the panel itself, which `height: 0` would leave showing.
 */
export const PANEL_MOTION =
    "overflow-hidden transition-[height] duration-(--pr-motion) ease-out data-starting-style:h-0 data-ending-style:h-0";

// spec/collapsible.md, "Anatomy"
export const collapsible: Recipe<"root" | "trigger" | "panel"> = {
    root: "flex flex-col items-start gap-2 font-primitives text-(length:--pr-size) text-palette-contrast",
    trigger: `${BUTTON} data-panel-open:bg-palette-soft`,
    panel: `w-full h-(--collapsible-panel-height) ${PANEL_MOTION} *:py-1 text-palette-accent/85`,
};
