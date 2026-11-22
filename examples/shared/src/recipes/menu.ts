// Adapted from the POC (@poc/styles, src/recipes/menu.ts).
import type { Recipe } from "./recipe.ts";
import { BUTTON, FLOATING_BOX, LIST_ITEM } from "./shared.ts";

// spec/menu.md, "Anatomy"; ContextMenu's parts are Menu's (recipes/context-menu)
export const menu: Recipe<
    | "trigger"
    | "positioner"
    | "popup"
    | "item"
    | "separator"
    | "group"
    | "group-label"
    | "submenu-trigger"
    | "checkbox-item"
    | "checkbox-item-indicator"
    | "radio-group"
    | "radio-item"
    | "radio-item-indicator"
> = {
    trigger: `${BUTTON} data-popup-open:bg-palette-soft`,
    positioner: "z-50",
    popup: `${FLOATING_BOX} min-w-40 p-1 outline-none`,
    item: LIST_ITEM,
    separator: "-mx-1 my-1 h-px bg-palette-line",
    group: "flex flex-col",
    "group-label": "px-2 py-1.5 text-xs font-medium text-palette-accent/85",
    "submenu-trigger": `${LIST_ITEM} justify-between data-popup-open:bg-palette-soft after:content-['›'] after:text-palette-accent/85 rtl:after:content-['‹']`,
    // a checkable item keeps its label aligned whether its indicator shows or not
    "checkbox-item": `${LIST_ITEM} ps-7 relative`,
    "checkbox-item-indicator":
        "absolute start-2 inline-flex w-4 justify-center text-xs",
    "radio-group": "flex flex-col",
    "radio-item": `${LIST_ITEM} ps-7 relative`,
    "radio-item-indicator":
        "absolute start-2 inline-flex w-4 justify-center text-xs",
};
