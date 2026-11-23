import type { Recipe } from "./recipe.ts";
import { BUTTON } from "./shared.ts";

// spec/pagination.md, "Anatomy". One row of square buttons (or links): the current page filled
// (`data-current`), the edges dimmed while disabled; the Ellipsis is plain text.
const CONTROL = `${BUTTON} min-w-(--pr-control-height) px-2 no-underline tabular-nums cursor-default select-none aria-disabled:opacity-50 aria-disabled:pointer-events-none data-disabled:cursor-not-allowed`;

export const pagination: Recipe<
    "root" | "list" | "item" | "ellipsis" | "control"
> = {
    root: "font-primitives text-(length:--pr-size) text-palette-contrast",
    list: "flex flex-wrap items-center gap-1",
    item: `${CONTROL} data-current:border-palette-contrast data-current:bg-palette-contrast data-current:text-palette-base data-current:hover:bg-palette-contrast`,
    ellipsis:
        "inline-flex h-(--pr-control-height) min-w-(--pr-control-height) items-center justify-center text-palette-accent select-none",
    control: CONTROL,
};
