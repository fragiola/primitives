import { PANEL_MOTION } from "./collapsible.ts";
import type { Recipe } from "./recipe.ts";
import { FOCUS_RING } from "./shared.ts";

// spec/accordion.md, "Anatomy": a bordered stack of sections, side by side when horizontal
export const accordion: Recipe<
    "root" | "item" | "header" | "trigger" | "panel"
> = {
    root: "flex flex-col w-(--pr-popup-width) max-w-full font-primitives text-(length:--pr-size) text-palette-contrast border border-palette-line rounded-control divide-y divide-palette-line data-[orientation=horizontal]:w-auto data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:divide-y-0 data-[orientation=horizontal]:divide-x",
    item: "flex flex-col",
    header: "m-0 text-(length:--pr-size) font-medium",
    trigger: `flex w-full items-center justify-between gap-2 h-(--pr-control-height) px-3 text-start font-medium rounded-control transition-colors duration-(--pr-motion) hover:bg-palette-soft disabled:opacity-50 data-panel-open:text-palette-contrast ${FOCUS_RING}`,
    panel: `h-(--accordion-panel-height) ${PANEL_MOTION} *:px-3 *:pb-3 text-palette-accent/85`,
};
