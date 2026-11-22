import type { Recipe } from "./recipe.ts";
import { FOCUS_RING } from "./shared.ts";

// spec/radio-group.md, "Anatomy" (RadioGroup): a column of radios, a row when horizontal
export const radioGroup: Recipe<"root"> = {
    root: "flex flex-col items-start gap-2 font-primitives text-(length:--pr-size) text-palette-contrast data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:gap-4 data-disabled:opacity-50",
};

// spec/radio-group.md, "Anatomy" (Radio): a round box, its dot drawn while checked
export const radio: Recipe<"root" | "indicator"> = {
    root: `inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-palette-line bg-palette-base transition-colors duration-(--pr-motion) data-checked:border-palette-contrast data-disabled:opacity-50 ${FOCUS_RING}`,
    indicator: "block size-2 rounded-full bg-palette-contrast",
};
