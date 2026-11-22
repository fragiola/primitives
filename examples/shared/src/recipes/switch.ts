import type { Recipe } from "./recipe.ts";
import { FOCUS_RING } from "./shared.ts";

// spec/switch.md, "Anatomy". The Thumb moves to the inline end while checked, with a logical
// margin (RTL-safe): 36 px of track, 1 px borders and 2 px of padding leave it 16 px to travel.
export const switchControl: Recipe<"root" | "thumb"> = {
    root: `inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-palette-line bg-palette-soft p-0.5 transition-colors duration-(--pr-motion) data-checked:border-palette-contrast data-checked:bg-palette-contrast data-invalid:border-palette-contrast data-disabled:opacity-50 ${FOCUS_RING}`,
    thumb: "block size-3.5 rounded-full bg-palette-base shadow-sm ring-1 ring-palette-line transition-[margin-inline-start] duration-(--pr-motion) data-checked:ms-4 data-checked:ring-palette-contrast",
};
