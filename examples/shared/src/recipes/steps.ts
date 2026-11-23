import type { Recipe } from "./recipe.ts";
import { BUTTON, FOCUS_RING } from "./shared.ts";

// spec/steps.md, "Anatomy". A row of numbered steps joined by lines: the current step's indicator
// in the ring colour, a completed one filled (`data-completed`), a step out of reach dimmed
// (`data-disabled`); the contents below, Back and Continue under them.
export const steps: Recipe<
    | "root"
    | "list"
    | "item"
    | "trigger"
    | "indicator"
    | "separator"
    | "content"
    | "controls"
    | "control"
> = {
    root: "flex w-96 flex-col gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
    list: "flex items-center gap-2",
    item: "flex flex-1 items-center gap-2 last:flex-none",
    trigger: `inline-flex items-center gap-2 rounded-control font-medium text-palette-accent data-current:text-palette-contrast data-completed:text-palette-contrast disabled:opacity-50 ${FOCUS_RING}`,
    indicator:
        "inline-flex size-6 items-center justify-center rounded-full border border-palette-line text-xs tabular-nums data-current:border-palette-ring data-current:text-palette-ring data-completed:border-palette-contrast data-completed:bg-palette-contrast data-completed:text-palette-base",
    separator: "h-px flex-1 bg-palette-line data-completed:bg-palette-contrast",
    content: "rounded-control border border-palette-line p-3",
    controls: "flex justify-between gap-2",
    control: BUTTON,
};
