import { menu } from "examples-shared/recipes/menu";

// The example's classes: the Menu recipe (one string per part), its submenu trigger under a
// name the markup can read without a string.
export const styles = { ...menu, submenuTrigger: menu["submenu-trigger"] };
