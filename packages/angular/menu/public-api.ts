// The entry of @fragiola/primitives-angular/menu: a menu of actions opened by a button, with
// submenus (spec/menu.md, the APG's menu button), as standalone attribute directives on the
// consumer's own elements.

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
export { MenuGroup } from "./directives/menu-group.directive.ts";
export { MenuGroupLabel } from "./directives/menu-group-label.directive.ts";
export {
    MenuItem,
    type MenuItemState,
} from "./directives/menu-item.directive.ts";
export {
    MenuPopup,
    type MenuPopupState,
} from "./directives/menu-popup.directive.ts";
export { MenuPortal } from "./directives/menu-portal.directive.ts";
export {
    MenuPositioner,
    type MenuPositionerState,
} from "./directives/menu-positioner.directive.ts";
export {
    MenuRoot,
    type MenuState,
} from "./directives/menu-root.directive.ts";
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
export { createMenuHandle, type MenuHandle } from "./utils/menu-handle.ts";
