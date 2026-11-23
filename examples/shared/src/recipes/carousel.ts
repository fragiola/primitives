import type { Recipe } from "./recipe.ts";
import { BUTTON, FOCUS_RING } from "./shared.ts";

// spec/carousel.md, "Anatomy". The slides in a 320 px window (the group's structural style lays
// them out and scrolls them), each a soft box with its number; the triggers and the indicator dots
// in a row under it, each dot a 24 px target (WCAG 2.2's target size); the current dot filled
// (`data-current`, or `aria-selected` in the tabbed variant).
const SLIDE =
    "flex items-center justify-center rounded-control border border-palette-line bg-palette-soft text-2xl font-semibold select-none";

export const carousel: Recipe<
    | "root"
    | "itemGroup"
    | "vertical"
    | "item"
    | "slide"
    | "verticalSlide"
    | "controls"
    | "control"
    | "indicatorGroup"
    | "indicator"
> = {
    root: "flex w-80 flex-col gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
    itemGroup: `w-80 rounded-control ${FOCUS_RING} data-dragging:cursor-grabbing`,
    vertical: "h-60",
    item: "min-w-0 min-h-0",
    slide: `${SLIDE} h-40`,
    verticalSlide: `${SLIDE} h-full`,
    controls: "flex items-center justify-between gap-2",
    control: BUTTON,
    indicatorGroup: "flex items-center gap-1",
    indicator: `inline-flex size-6 items-center justify-center rounded-full before:size-3 before:rounded-full before:border before:border-palette-contrast before:transition-colors before:duration-(--pr-motion) before:content-[''] data-current:before:bg-palette-contrast aria-selected:before:bg-palette-contrast ${FOCUS_RING}`,
};
