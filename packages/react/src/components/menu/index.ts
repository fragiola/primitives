// The entry of @fragiola/primitives-react/menu: a menu of actions opened by a button, with
// submenus, checkbox items and radio items (spec/menu.md, the APG's menu button).

export type {
    Align,
    Side,
} from "@fragiola/primitives/positioning";
export type { OverlayPortalProps } from "../../hooks/use-overlay-portal.ts";
export type {
    OverlayRootProps,
    OverlayTriggerRootProps,
} from "../../hooks/use-overlay-root.ts";
export type { OverlayTriggerProps } from "../../hooks/use-overlay-trigger.ts";
export type { PositionerProps } from "../../hooks/use-positioner.ts";
export type {
    ChangeDetails,
    ChangeReason,
    OpenChangeDetails,
    OverlayActions,
} from "../../utils/change-details.ts";
export type { OverlayHandle } from "../../utils/overlay-handle.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export type {
    MenuCheckboxItemProps,
    MenuCheckboxItemState,
} from "./menu-checkbox-item.tsx";
export type { MenuCheckboxItemIndicatorProps } from "./menu-checkbox-item-indicator.tsx";
export type { MenuCheckableItemState } from "./menu-context.ts";
export { createMenuHandle, type MenuHandle } from "./menu-handle.ts";
export type { MenuItemProps, MenuItemState } from "./menu-item.tsx";
export type { MenuPortalProps } from "./menu-portal.tsx";
export type {
    MenuPositionerProps,
    MenuPositionerState,
} from "./menu-positioner.tsx";
export type { MenuRadioGroupProps } from "./menu-radio-group.tsx";
export type {
    MenuRadioItemProps,
    MenuRadioItemState,
} from "./menu-radio-item.tsx";
export type { MenuRadioItemIndicatorProps } from "./menu-radio-item-indicator.tsx";
export type { MenuRootProps, MenuSubmenuRootProps } from "./menu-root.tsx";
export type {
    MenuSubmenuTriggerProps,
    MenuSubmenuTriggerState,
} from "./menu-submenu-trigger.tsx";
export type { MenuTriggerProps, MenuTriggerState } from "./menu-trigger.tsx";
export { Menu } from "./parts.ts";
