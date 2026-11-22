/** The roles of a menu's items (spec/menu.md, "State attributes and ARIA"). */
const ITEMS =
    '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]';

/** The items of one menu level, in order (a submenu's items live in its own popup). */
export function menuItems(popup: HTMLElement): HTMLElement[] {
    return [...popup.querySelectorAll<HTMLElement>(ITEMS)].filter(
        (item) => item.closest('[role="menu"]') === popup,
    );
}
