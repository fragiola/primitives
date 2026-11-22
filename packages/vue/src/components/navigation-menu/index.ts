// The entry of @fragiola/primitives-vue/navigation-menu: a site's navigation, the APG disclosure
// navigation menu with Base UI's hover, shared popup and nested levels (spec/navigation-menu.md).

export type { ActivationDirection } from "@fragiola/primitives/collection";
export type { Align, Side } from "@fragiola/primitives/positioning";
export type { PositionerProps } from "../../composables/use-positioner.ts";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type { NavigationMenuContentState } from "./navigation-menu-content.ts";
export type { NavigationMenuOrientation } from "./navigation-menu-context.ts";
export type { NavigationMenuItemProps } from "./navigation-menu-item.ts";
export type { NavigationMenuLinkProps } from "./navigation-menu-link.ts";
export type { NavigationMenuListState } from "./navigation-menu-list.ts";
export type { NavigationMenuPopupState } from "./navigation-menu-popup.ts";
export type { NavigationMenuPortalProps } from "./navigation-menu-portal.ts";
export type { NavigationMenuPositionerState } from "./navigation-menu-positioner.ts";
export type {
    NavigationMenuRootEmits,
    NavigationMenuRootProps,
    NavigationMenuRootState,
} from "./navigation-menu-root.ts";
export type {
    NavigationMenuTriggerProps,
    NavigationMenuTriggerState,
} from "./navigation-menu-trigger.ts";
export { NavigationMenu } from "./parts.ts";
