import type { Recipe } from "./recipe.ts";
import { BUTTON, FLOATING_BOX, LIST_ITEM } from "./shared.ts";

// spec/cascade-select.md, "Anatomy": the levels side by side, whole-pixel widths (the pointer
// tests cross them diagonally)
export const cascadeSelect: Recipe<
    | "trigger"
    | "value"
    | "positioner"
    | "popup"
    | "level"
    | "item"
    | "item-indicator"
> = {
    trigger: `${BUTTON.replace("justify-center", "justify-between")} min-w-56 data-popup-open:bg-palette-soft data-invalid:border-2 data-invalid:border-palette-contrast`,
    value: "truncate data-placeholder:text-palette-accent/85",
    positioner: "z-50",
    popup: `${FLOATING_BOX} flex max-h-(--available-height)`,
    level: "flex w-40 flex-col overflow-y-auto p-1 outline-none not-first:border-s not-first:border-palette-line",
    item: `${LIST_ITEM} justify-between data-selected:font-semibold data-expanded:bg-palette-soft/60`,
    "item-indicator": "ms-auto text-xs",
};
