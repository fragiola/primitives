import type { Signal } from "@angular/core";
import { injectEnclosing } from "@fragiola/primitives-angular/internal";
import { MenuRootBase, type MenuState } from "../directives/menu-root-base.ts";

/**
 * The part hook of the enclosing menu level (`[menuRoot]` or `[menuSubmenuRoot]`): its state, and
 * a way to close every level (as an item does).
 */
export function injectMenu(): {
    state: Signal<MenuState>;
    closeAll: () => void;
} {
    const level = injectEnclosing(MenuRootBase, "menuRoot", "injectMenu");
    return {
        state: level.state,
        closeAll: () => level.closeAll("item-press"),
    };
}
