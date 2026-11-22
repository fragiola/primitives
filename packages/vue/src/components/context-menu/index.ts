// The entry of @fragiola/primitives-vue/context-menu: a menu opened from an area at the pointer, by
// a long press or by the ContextMenu key (spec/context-menu.md). Its parts are Menu's, from the
// menu's modules, named `context-menu-*` by its Root.

export type {
    Align,
    Side,
} from "@fragiola/primitives/positioning";
export type {
    OverlayRootEmits,
    OverlayRootProps,
} from "../../composables/use-overlay-root.ts";
export type { PositionerProps } from "../../composables/use-positioner.ts";
export type {
    ChangeDetails,
    ChangeReason,
    OpenChangeDetails,
    OverlayActions,
} from "../../utils/change-details.ts";
export type { OverlayPortalProps } from "../../utils/overlay-portal.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type {
    MenuCheckboxItemEmits as ContextMenuCheckboxItemEmits,
    MenuCheckboxItemProps as ContextMenuCheckboxItemProps,
    MenuCheckboxItemState as ContextMenuCheckboxItemState,
} from "../menu/menu-checkbox-item.ts";
export type { MenuCheckboxItemIndicatorProps as ContextMenuCheckboxItemIndicatorProps } from "../menu/menu-checkbox-item-indicator.ts";
export type {
    MenuItemProps as ContextMenuItemProps,
    MenuItemState as ContextMenuItemState,
} from "../menu/menu-item.ts";
export type { MenuPopupState as ContextMenuPopupState } from "../menu/menu-popup.ts";
export type { MenuPortalProps as ContextMenuPortalProps } from "../menu/menu-portal.ts";
export type { MenuPositionerState as ContextMenuPositionerState } from "../menu/menu-positioner.ts";
export type {
    MenuRadioGroupEmits as ContextMenuRadioGroupEmits,
    MenuRadioGroupProps as ContextMenuRadioGroupProps,
} from "../menu/menu-radio-group.ts";
export type {
    MenuRadioItemProps as ContextMenuRadioItemProps,
    MenuRadioItemState as ContextMenuRadioItemState,
} from "../menu/menu-radio-item.ts";
export type { MenuRadioItemIndicatorProps as ContextMenuRadioItemIndicatorProps } from "../menu/menu-radio-item-indicator.ts";
export type { MenuSubmenuRootProps as ContextMenuSubmenuRootProps } from "../menu/menu-root.ts";
export type {
    MenuSubmenuTriggerProps as ContextMenuSubmenuTriggerProps,
    MenuSubmenuTriggerState as ContextMenuSubmenuTriggerState,
} from "../menu/menu-submenu-trigger.ts";
export type {
    ContextMenuRootEmits,
    ContextMenuRootProps,
} from "./context-menu-root.ts";
export type { ContextMenuTriggerState } from "./context-menu-trigger.ts";
export { ContextMenu } from "./parts.ts";
