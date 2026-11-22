// Adapted from the POC (@poc/styles, src/recipes/calendar.ts).
import type { Recipe } from "./recipe.ts";
import { BUTTON, FOCUS_RING } from "./shared.ts";

// spec/calendar.md, "Anatomy" (Calendar and RangeCalendar share the parts). Round days on the
// themes' radius, a dot under today, ranges rounded at their ends; a chosen day is painted as a
// checked checkbox (contrast on base).
export const calendar: Recipe<
    | "root"
    | "heading"
    | "prev-button"
    | "next-button"
    | "grid"
    | "grid-header"
    | "header-cell"
    | "grid-body"
    | "row"
    | "cell"
> = {
    root: "inline-flex flex-col gap-3 font-primitives text-(length:--pr-size) text-palette-contrast",
    heading: "font-semibold text-center",
    "prev-button": `${BUTTON} size-(--pr-control-height) px-0`,
    "next-button": `${BUTTON} size-(--pr-control-height) px-0`,
    grid: "border-collapse",
    "grid-header": "",
    "header-cell": "size-10 p-0 text-xs font-medium text-palette-accent/85",
    "grid-body": "",
    row: "",
    cell: `relative size-10 p-0 text-center cursor-default select-none rounded-control transition-colors duration-(--pr-motion) ${FOCUS_RING} hover:bg-palette-soft data-today:font-semibold data-today:after:absolute data-today:after:inset-x-0 data-today:after:bottom-1 data-today:after:mx-auto data-today:after:size-1 data-today:after:rounded-full data-today:after:bg-current data-outside-month:text-palette-accent/40 data-outside-month:hover:bg-transparent data-disabled:opacity-40 data-disabled:hover:bg-transparent data-unavailable:line-through data-unavailable:opacity-50 data-range-preview:rounded-none data-range-preview:bg-palette-soft data-in-range:rounded-none data-in-range:bg-palette-soft data-range-start:rounded-s-control data-range-end:rounded-e-control data-selected:bg-palette-contrast data-selected:text-palette-base data-in-range:data-selected:bg-palette-soft data-in-range:data-selected:text-palette-contrast data-range-start:data-selected:bg-palette-contrast data-range-start:data-selected:text-palette-base data-range-end:data-selected:bg-palette-contrast data-range-end:data-selected:text-palette-base`,
};
