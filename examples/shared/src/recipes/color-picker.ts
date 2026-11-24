import type { Recipe } from "./recipe.ts";
import { BUTTON, FOCUS_RING } from "./shared.ts";

// spec/color-picker.md, "Anatomy". The Root stacks the controls it holds; the FormatSelect is a
// native select styled as a control, the EyeDropperTrigger a button.
export const colorPicker: Recipe<
    "root" | "format-select" | "eye-dropper-trigger"
> = {
    root: "flex flex-col items-start gap-3 font-primitives text-(length:--pr-size) text-palette-contrast",
    "format-select": `h-(--pr-control-height) rounded-control border border-palette-line bg-palette-base px-2 text-palette-contrast data-disabled:opacity-50 ${FOCUS_RING}`,
    "eye-dropper-trigger": BUTTON,
};
