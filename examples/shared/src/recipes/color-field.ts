import type { Recipe } from "./recipe.ts";
import { FOCUS_RING } from "./shared.ts";

// spec/color-field.md, "Anatomy". One bordered text input, the invalid border of a Field.
export const colorField: Recipe<"root" | "input"> = {
    root: "inline-flex flex-col items-start gap-1 font-primitives text-(length:--pr-size) text-palette-contrast",
    input: `h-(--pr-control-height) w-36 rounded-control border border-palette-line bg-palette-base px-3 tabular-nums text-palette-contrast data-invalid:border-2 data-invalid:border-palette-contrast data-disabled:opacity-50 ${FOCUS_RING}`,
};
