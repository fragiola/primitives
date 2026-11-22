// The entry of @fragiola/primitives-react/navigation-menu: a site's navigation, the APG disclosure
// navigation menu with Base UI's hover, shared popup and nested levels (spec/navigation-menu.md).

export type { ActivationDirection } from "@fragiola/primitives/collection";
export type { Align, Side } from "@fragiola/primitives/positioning";
export type { PositionerProps } from "../../hooks/use-positioner.ts";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export type { NavigationMenuContentState } from "./navigation-menu-content.tsx";
export type { NavigationMenuOrientation } from "./navigation-menu-context.ts";
export type { NavigationMenuItemProps } from "./navigation-menu-item.tsx";
export type { NavigationMenuLinkProps } from "./navigation-menu-link.tsx";
export type { NavigationMenuPopupState } from "./navigation-menu-popup.tsx";
export type { NavigationMenuPortalProps } from "./navigation-menu-portal.tsx";
export type {
    NavigationMenuPositionerProps,
    NavigationMenuPositionerState,
} from "./navigation-menu-positioner.tsx";
export type {
    NavigationMenuRootProps,
    NavigationMenuRootState,
} from "./navigation-menu-root.tsx";
export type {
    NavigationMenuTriggerProps,
    NavigationMenuTriggerState,
} from "./navigation-menu-trigger.tsx";
export { NavigationMenu } from "./parts.ts";
