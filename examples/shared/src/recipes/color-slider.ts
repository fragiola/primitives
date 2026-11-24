import type { Recipe } from "./recipe.ts";
import { COLOR_THUMB, FOCUS_RING } from "./shared.ts";

// spec/color-slider.md, "Anatomy". The Track draws the channel's gradient (its CSS variable), over
// a checkerboard for the alpha channel; it is 200 px long and starts on a whole pixel (the Label has
// a fixed width), as the scenarios expect. The Thumb is a disc of the color.
export const colorSlider: Recipe<
    "root" | "label" | "output" | "track" | "thumb"
> = {
    root: "inline-flex items-center gap-3 font-primitives text-(length:--pr-size) text-palette-contrast data-[orientation=vertical]:flex-col data-disabled:opacity-50",
    label: "w-16 shrink-0 font-medium",
    output: "min-w-12 tabular-nums text-palette-accent",
    track: "h-6 w-50 rounded-control data-[orientation=horizontal]:mx-2.5 data-[orientation=vertical]:my-2.5 [background:var(--color-slider-track-background)] data-[channel=alpha]:[background:var(--color-slider-track-background),repeating-conic-gradient(#d4d4d8_0%_25%,#ffffff_0%_50%)_50%/12px_12px] data-[orientation=vertical]:h-50 data-[orientation=vertical]:w-6",
    thumb: `${COLOR_THUMB} [background:var(--color-slider-thumb-color)] ${FOCUS_RING}`,
};
