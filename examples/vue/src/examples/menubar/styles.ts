import { menu } from "examples-shared/recipes/menu";
import { menubar } from "examples-shared/recipes/menubar";

// The example's classes: the Menubar recipe (the bar and its triggers), the Menu recipe for the
// menus (its parts under names the markup can read without a string), and the summary.
export const styles = {
    ...menu,
    bar: menubar.root,
    trigger: menubar.trigger,
    submenuTrigger: menu["submenu-trigger"],
    checkboxItem: menu["checkbox-item"],
    checkboxItemIndicator: menu["checkbox-item-indicator"],
    groupLabel: menu["group-label"],
    radioGroup: menu["radio-group"],
    radioItem: menu["radio-item"],
    radioItemIndicator: menu["radio-item-indicator"],
    stack: "flex flex-col items-start gap-3 font-primitives text-(length:--pr-size) text-palette-contrast",
    summary:
        "grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-palette-accent/85 [&_dt]:font-medium [&_dt]:text-palette-contrast",
};
