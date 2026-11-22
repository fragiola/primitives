// The entry of @fragiola/primitives-angular/navigation-menu: a site's navigation, the APG
// disclosure navigation menu with Base UI's hover, shared popup and nested levels
// (spec/navigation-menu.md), as standalone directives on the consumer's own elements.

export type { ActivationDirection } from "@fragiola/primitives/collection";
export type { Align, Side } from "@fragiola/primitives/positioning";
export type {
    ChangeDetails,
    ChangeReason,
    OverlayPortalOptions,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { NavigationMenuArrow } from "./directives/navigation-menu-arrow.directive.ts";
export { NavigationMenuBackdrop } from "./directives/navigation-menu-backdrop.directive.ts";
export {
    NavigationMenuContent,
    type NavigationMenuContentState,
} from "./directives/navigation-menu-content.directive.ts";
export { NavigationMenuIcon } from "./directives/navigation-menu-icon.directive.ts";
export { NavigationMenuItem } from "./directives/navigation-menu-item.directive.ts";
export { NavigationMenuLink } from "./directives/navigation-menu-link.directive.ts";
export { NavigationMenuList } from "./directives/navigation-menu-list.directive.ts";
export {
    NavigationMenuPopup,
    type NavigationMenuPopupState,
} from "./directives/navigation-menu-popup.directive.ts";
export { NavigationMenuPortal } from "./directives/navigation-menu-portal.directive.ts";
export {
    NavigationMenuPositioner,
    type NavigationMenuPositionerState,
} from "./directives/navigation-menu-positioner.directive.ts";
export {
    NAVIGATION_MENU_CONTENT,
    type NavigationMenuOrientation,
    NavigationMenuRoot,
    type NavigationMenuRootState,
} from "./directives/navigation-menu-root.directive.ts";
export {
    NavigationMenuTrigger,
    type NavigationMenuTriggerState,
} from "./directives/navigation-menu-trigger.directive.ts";
export { NavigationMenuViewport } from "./directives/navigation-menu-viewport.directive.ts";
