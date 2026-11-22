// Adapted from the POC (@poc/styles, src/recipes/combobox.ts).
import type { Recipe } from "./recipe.ts";
import { FLOATING_BOX, LIST_ITEM } from "./shared.ts";

/** The box around the input: a field row, with the focus ring and the invalid border of a Field. */
const BOX =
    "rounded-control border border-palette-line bg-palette-base font-primitives text-(length:--pr-size) focus-within:outline-solid focus-within:outline-(length:--pr-focus-width) focus-within:outline-offset-2 focus-within:outline-palette-ring has-[[data-invalid]]:border-2 has-[[data-invalid]]:border-palette-contrast";

/** A small square button inside the box (Trigger, Clear). */
const BOX_BUTTON =
    "inline-flex size-7 shrink-0 items-center justify-center rounded-control text-palette-accent/85 hover:bg-palette-soft disabled:opacity-50";

// spec/combobox.md, "Anatomy"
export const combobox: Recipe<
    | "input-group"
    | "input"
    | "trigger"
    | "clear"
    | "chips"
    | "chip"
    | "chip-remove"
    | "status"
    | "positioner"
    | "popup"
    | "empty"
    | "list"
    | "group"
    | "group-label"
    | "separator"
    | "item"
    | "item-indicator"
> = {
    "input-group": `${BOX} flex h-(--pr-control-height) w-64 items-center gap-1 ps-3 pe-1 data-disabled:opacity-50`,
    input: "h-full min-w-12 flex-1 bg-transparent text-palette-contrast outline-none",
    trigger: `${BOX_BUTTON} data-popup-open:bg-palette-soft`,
    clear: BOX_BUTTON,
    chips: `${BOX} flex min-h-(--pr-control-height) w-72 flex-wrap items-center gap-1 py-1 ps-1.5 pe-1`,
    chip: "inline-flex h-6 items-center gap-1 rounded-control bg-palette-soft ps-2 pe-0.5 text-xs text-palette-contrast outline-hidden focus:outline-solid focus:outline-(length:--pr-focus-width) focus:outline-palette-ring",
    "chip-remove":
        "inline-flex size-5 items-center justify-center rounded-control text-palette-accent/85 hover:bg-palette-base",
    status: "sr-only",
    positioner: "z-50",
    popup: `${FLOATING_BOX} w-(--anchor-width) min-w-56 max-h-(--available-height) overflow-y-auto p-1`,
    // a live region stays rendered: with no text it takes no room
    empty: "px-2 py-3 text-palette-accent/85 empty:p-0",
    list: "flex flex-col outline-none data-empty:hidden",
    group: "flex flex-col",
    "group-label": "px-2 pt-2 pb-1 text-xs font-medium text-palette-accent",
    separator: "-mx-1 my-1 h-px bg-palette-line",
    item: `${LIST_ITEM} justify-between data-selected:font-semibold`,
    "item-indicator": "text-xs",
};
