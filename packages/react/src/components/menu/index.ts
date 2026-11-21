// The entry of @fragiola/primitives-react/menu: a menu of actions opened by a button, with
// submenus (spec/menu.md, the APG's menu button).

export type {
    Align,
    Side,
} from "@fragiola/primitives/positioning";
export type { PositionerProps } from "../../hooks/use-positioner.ts";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export type { MenuItemProps, MenuItemState } from "./menu-item.tsx";
export type { MenuPortalProps } from "./menu-portal.tsx";
export type { MenuPositionerProps } from "./menu-positioner.tsx";
export type { MenuRootProps, MenuSubmenuRootProps } from "./menu-root.tsx";
export type {
    MenuSubmenuTriggerProps,
    MenuSubmenuTriggerState,
} from "./menu-submenu-trigger.tsx";
export type { MenuTriggerProps, MenuTriggerState } from "./menu-trigger.tsx";
export { Menu } from "./parts.ts";
