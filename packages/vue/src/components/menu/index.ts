// The entry of @fragiola/primitives-vue/menu: a menu of actions opened by a button, with submenus
// (spec/menu.md, the APG's menu button).

export type {
    Align,
    Side,
} from "@fragiola/primitives/positioning";
export type {
    OverlayRootEmits,
    OverlayRootProps,
    OverlayTriggerRootProps,
} from "../../composables/use-overlay-root.ts";
export type { OverlayTriggerProps } from "../../composables/use-overlay-trigger.ts";
export type { PositionerProps } from "../../composables/use-positioner.ts";
export type {
    ChangeDetails,
    ChangeReason,
    OpenChangeDetails,
    OverlayActions,
} from "../../utils/change-details.ts";
export type { OverlayHandle } from "../../utils/overlay-handle.ts";
export type { OverlayPortalProps } from "../../utils/overlay-portal.ts";
export type { OverlayRootSlots } from "../../utils/public-component.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export { createMenuHandle, type MenuHandle } from "./menu-handle.ts";
export type { MenuItemProps, MenuItemState } from "./menu-item.ts";
export type { MenuPopupState } from "./menu-popup.ts";
export type { MenuPortalProps } from "./menu-portal.ts";
export type { MenuPositionerState } from "./menu-positioner.ts";
export type {
    MenuRootEmits,
    MenuRootProps,
    MenuSubmenuRootProps,
} from "./menu-root.ts";
export type {
    MenuSubmenuTriggerProps,
    MenuSubmenuTriggerState,
} from "./menu-submenu-trigger.ts";
export type { MenuTriggerProps, MenuTriggerState } from "./menu-trigger.ts";
export { Menu } from "./parts.ts";
