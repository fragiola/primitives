import type { Recipe } from "./recipe.ts";
import { FOCUS_RING } from "./shared.ts";

// spec/month-calendar.md, "Anatomy" (the month and year calendars share the parts; the header
// buttons and the root take the calendar recipe, calendar.ts). A wide cell per month or year, the
// calendar's selection, today and range painting.
export const monthCalendar: Recipe<"grid" | "grid-body" | "row" | "cell"> = {
    grid: "border-collapse",
    "grid-body": "",
    row: "",
    cell: `relative h-10 w-[4.5rem] p-0 text-center cursor-default select-none rounded-control transition-colors duration-(--pr-motion) ${FOCUS_RING} hover:bg-palette-soft data-today:font-semibold data-today:after:absolute data-today:after:inset-x-0 data-today:after:bottom-1 data-today:after:mx-auto data-today:after:size-1 data-today:after:rounded-full data-today:after:bg-current data-disabled:opacity-40 data-disabled:hover:bg-transparent data-unavailable:line-through data-unavailable:opacity-50 data-range-preview:rounded-none data-range-preview:bg-palette-soft data-in-range:rounded-none data-in-range:bg-palette-soft data-range-start:rounded-s-control data-range-end:rounded-e-control data-selected:bg-palette-contrast data-selected:text-palette-base data-in-range:data-selected:bg-palette-soft data-in-range:data-selected:text-palette-contrast data-range-start:data-selected:bg-palette-contrast data-range-start:data-selected:text-palette-base data-range-end:data-selected:bg-palette-contrast data-range-end:data-selected:text-palette-base`,
};
