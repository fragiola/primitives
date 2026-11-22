// The entry of @fragiola/primitives-angular/context-menu: a menu opened from an area at the
// pointer, by a long press or by the ContextMenu key (spec/context-menu.md). Its directives are
// Menu's (`@fragiola/primitives-angular/menu`) under their own selectors, named `context-menu-*`
// by its root.

export type { Align, Side } from "@fragiola/primitives/positioning";
export type {
    ChangeDetails,
    ChangeReason,
    OpenChangeDetails,
    OpenChangeEvent,
    OverlayActions,
    OverlayPortalOptions,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export type {
    MenuCheckableItemState as ContextMenuCheckableItemState,
    MenuCheckboxItemState as ContextMenuCheckboxItemState,
    MenuItemState as ContextMenuItemState,
    MenuPopupState as ContextMenuPopupState,
    MenuPositionerState as ContextMenuPositionerState,
    MenuRadioItemState as ContextMenuRadioItemState,
    MenuState as ContextMenuState,
    MenuSubmenuTriggerState as ContextMenuSubmenuTriggerState,
} from "@fragiola/primitives-angular/menu";
export { ContextMenuCheckboxItem } from "./directives/context-menu-checkbox-item.directive.ts";
export { ContextMenuCheckboxItemIndicator } from "./directives/context-menu-checkbox-item-indicator.directive.ts";
export { ContextMenuGroup } from "./directives/context-menu-group.directive.ts";
export { ContextMenuGroupLabel } from "./directives/context-menu-group-label.directive.ts";
export { ContextMenuItem } from "./directives/context-menu-item.directive.ts";
export { ContextMenuPopup } from "./directives/context-menu-popup.directive.ts";
export { ContextMenuPortal } from "./directives/context-menu-portal.directive.ts";
export { ContextMenuPositioner } from "./directives/context-menu-positioner.directive.ts";
export { ContextMenuRadioGroup } from "./directives/context-menu-radio-group.directive.ts";
export { ContextMenuRadioItem } from "./directives/context-menu-radio-item.directive.ts";
export { ContextMenuRadioItemIndicator } from "./directives/context-menu-radio-item-indicator.directive.ts";
export {
    type ContextMenuPoint,
    ContextMenuRoot,
} from "./directives/context-menu-root.directive.ts";
export { ContextMenuSeparator } from "./directives/context-menu-separator.directive.ts";
export { ContextMenuSubmenuRoot } from "./directives/context-menu-submenu-root.directive.ts";
export { ContextMenuSubmenuTrigger } from "./directives/context-menu-submenu-trigger.directive.ts";
export {
    ContextMenuTrigger,
    type ContextMenuTriggerState,
} from "./directives/context-menu-trigger.directive.ts";
