import type { Recipe } from "./recipe.ts";
import { BUTTON } from "./shared.ts";

// spec/menubar.md, "Anatomy": a bordered row of menu triggers, a column when vertical
// (`data-orientation`); its triggers are borderless buttons, soft while their menu is open
// (`data-popup-open`), dimmed while disabled. The menus are Menu's parts (recipes/menu).
export const menubar: Recipe<"root" | "trigger"> = {
    root: "inline-flex items-center gap-1 rounded-control border border-palette-line bg-palette-base p-1 font-primitives text-(length:--pr-size) text-palette-contrast data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch data-disabled:opacity-50",
    trigger: `${BUTTON} cursor-default select-none border-transparent data-popup-open:bg-palette-soft data-disabled:cursor-not-allowed`,
};
