// The entry of @fragiola/primitives-vue/menu: a menu of actions opened by a button, with submenus
// (spec/menu.md, the APG's menu button).

export type {
    Align,
    Side,
} from "@fragiola/primitives/positioning";
export type { PositionerProps } from "../../composables/use-positioner.ts";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
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
