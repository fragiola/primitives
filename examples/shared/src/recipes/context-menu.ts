import { menu } from "./menu.ts";
import type { Recipe } from "./recipe.ts";

// spec/context-menu.md, "Anatomy": Menu's parts, opened from an area
export const contextMenu: Recipe<
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
    ...menu,
    trigger:
        "flex select-none [-webkit-touch-callout:none] flex-col items-start gap-2 rounded-popup border border-dashed border-palette-line p-3 text-palette-accent/85 data-popup-open:bg-palette-soft",
};
