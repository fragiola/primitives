import type { Recipe } from "./recipe.ts";
import { BUTTON, FOCUS_RING } from "./shared.ts";

// spec/toolbar.md, "Anatomy": a bordered row of items, a column when vertical
// (`data-orientation`); its groups follow the orientation, its separators run across it, its
// input is a text field the height of a button.
export const toolbar: Recipe<
    "root" | "button" | "link" | "input" | "group" | "separator"
> = {
    root: "inline-flex items-center gap-1 rounded-control border border-palette-line bg-palette-base p-1 font-primitives text-(length:--pr-size) text-palette-contrast data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch data-disabled:opacity-50",
    button: `${BUTTON} cursor-default select-none border-transparent data-disabled:cursor-not-allowed`,
    link: `inline-flex h-(--pr-control-height) items-center rounded-control px-3 font-medium text-palette-contrast underline-offset-4 hover:underline ${FOCUS_RING}`,
    input: `h-(--pr-control-height) w-32 rounded-control border border-palette-line bg-palette-base px-2 text-palette-contrast data-disabled:opacity-50 ${FOCUS_RING}`,
    group: "inline-flex items-center gap-1 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch data-disabled:opacity-50",
    separator:
        "shrink-0 bg-palette-line data-[orientation=vertical]:mx-1 data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch data-[orientation=horizontal]:my-1 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:self-stretch",
};
