import type { Recipe } from "./recipe.ts";
import { LIST_ITEM } from "./shared.ts";

// spec/listbox.md, "Anatomy": a bordered box of rows that stays on the page (a row of options when
// horizontal), the focused option highlighted (`data-highlighted`, with a ring on keyboard focus),
// the selected ones bold with their check; the invalid border of a Field.
export const listbox: Recipe<
    "root" | "item" | "item-indicator" | "group" | "group-label" | "separator"
> = {
    root: "flex w-56 flex-col gap-0.5 overflow-y-auto rounded-control border border-palette-line bg-palette-base p-1 font-primitives text-(length:--pr-size) text-palette-contrast data-[orientation=horizontal]:w-auto data-[orientation=horizontal]:flex-row data-disabled:opacity-50 data-invalid:border-2 data-invalid:border-palette-contrast",
    item: `${LIST_ITEM} justify-between data-selected:font-semibold focus-visible:outline-solid focus-visible:outline-(length:--pr-focus-width) focus-visible:-outline-offset-2 focus-visible:outline-palette-ring`,
    "item-indicator": "text-xs",
    group: "flex flex-col gap-0.5",
    "group-label": "px-2 pt-2 pb-1 text-xs font-medium text-palette-accent",
    separator:
        "-mx-1 my-1 h-px bg-palette-line data-[orientation=vertical]:mx-1 data-[orientation=vertical]:my-0 data-[orientation=vertical]:h-auto data-[orientation=vertical]:w-px",
};
