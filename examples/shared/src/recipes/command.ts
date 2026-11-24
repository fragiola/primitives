import type { Recipe } from "./recipe.ts";
import { LIST_ITEM } from "./shared.ts";

// spec/command.md, "Anatomy": a panel with the input on top and the list below it, its own
// scroll container (a virtual list scrolls itself); every size a whole number of pixels
export const command: Recipe<
    | "root"
    | "input"
    | "list"
    | "group"
    | "group-label"
    | "separator"
    | "item"
    | "empty"
    | "loading"
> = {
    root: "palette-raised flex w-80 flex-col overflow-hidden rounded-popup border border-palette-line bg-palette-base text-palette-contrast font-primitives text-(length:--pr-size)",
    input: "h-11 border-b border-palette-line bg-transparent px-3 text-palette-contrast outline-none placeholder:text-palette-accent/70",
    list: "flex max-h-72 flex-col overflow-y-auto p-1 outline-none data-empty:hidden",
    group: "flex flex-col",
    "group-label": "px-2 pt-2 pb-1 text-xs font-medium text-palette-accent",
    separator: "-mx-1 my-1 h-px shrink-0 bg-palette-line",
    item: LIST_ITEM,
    // live regions stay rendered: with no text they take no room
    empty: "px-3 py-6 text-center text-palette-accent/85 empty:p-0",
    loading: "px-3 py-2 text-palette-accent/85 empty:p-0",
};
