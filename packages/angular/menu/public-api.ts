// The entry of @fragiola/primitives-angular/menu: a menu of actions opened by a button, with
// submenus, checkbox items and radio items (spec/menu.md, the APG's menu button), as standalone
// attribute directives on the consumer's own elements.

export type { Align, Side } from "@fragiola/primitives/positioning";
export type {
    ChangeDetails,
    ChangeReason,
    OpenChangeDetails,
    OpenChangeEvent,
    OverlayActions,
    OverlayHandle,
    OverlayPortalOptions,
} from "@fragiola/primitives-angular/internal";
export {
    indicatorOptions,
    type MenuCheckableItemState,
} from "./directives/menu-checkable-item.ts";
export {
    MenuCheckboxItem,
    type MenuCheckboxItemState,
} from "./directives/menu-checkbox-item.directive.ts";
export { MenuCheckboxItemIndicator } from "./directives/menu-checkbox-item-indicator.directive.ts";
export { MenuGroup } from "./directives/menu-group.directive.ts";
export { MenuGroupLabel } from "./directives/menu-group-label.directive.ts";
export {
    MenuItem,
    type MenuItemState,
} from "./directives/menu-item.directive.ts";
export { menuItems } from "./directives/menu-items.ts";
export {
    MenuPopup,
    type MenuPopupState,
} from "./directives/menu-popup.directive.ts";
export { MenuPortal } from "./directives/menu-portal.directive.ts";
export {
    MenuPositioner,
    type MenuPositionerState,
} from "./directives/menu-positioner.directive.ts";
export { MenuRadioGroup } from "./directives/menu-radio-group.directive.ts";
export {
    MenuRadioItem,
    type MenuRadioItemState,
} from "./directives/menu-radio-item.directive.ts";
export { MenuRadioItemIndicator } from "./directives/menu-radio-item-indicator.directive.ts";
export { MenuRoot } from "./directives/menu-root.directive.ts";
export {
    type MenuComponent,
    MenuRootBase,
    type MenuState,
    type SafeArea,
} from "./directives/menu-root-base.ts";
export { MenuSeparator } from "./directives/menu-separator.directive.ts";
export {
    MenuSubmenuTrigger,
    type MenuSubmenuTriggerState,
} from "./directives/menu-submenu-trigger.directive.ts";
export {
    MenuTrigger,
    type MenuTriggerState,
} from "./directives/menu-trigger.directive.ts";
export { injectMenu } from "./inject/inject-menu.ts";
export {
    MENU_BAR,
    type MenuBar,
    type MenuBarEntry,
} from "./utils/menu-bar.ts";
export { createMenuHandle, type MenuHandle } from "./utils/menu-handle.ts";
export { MENU_SUBMENU } from "./utils/menu-submenu.ts";
