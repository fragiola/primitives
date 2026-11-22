import { InjectionToken } from "@angular/core";

/**
 * Provided (as `true`) by a submenu root directive whose selector is not `[menuSubmenuRoot]`
 * (ContextMenu's `[contextMenuSubmenuRoot]`): the level it sits on is a submenu. Read on its own
 * element only.
 */
export const MENU_SUBMENU = new InjectionToken<boolean>("MenuSubmenu");
