// The entry of @fragiola/primitives-react/context-menu: a menu opened from an area at the pointer,
// by a long press or by the ContextMenu key (spec/context-menu.md). Its parts are Menu's, from the
// menu's modules, named `context-menu-*` by its Root.

export type {
    Align,
    Side,
} from "@fragiola/primitives/positioning";
export type { OverlayPortalProps } from "../../hooks/use-overlay-portal.ts";
export type { OverlayRootProps } from "../../hooks/use-overlay-root.ts";
export type { PositionerProps } from "../../hooks/use-positioner.ts";
export type {
    ChangeDetails,
    ChangeReason,
    OpenChangeDetails,
    OverlayActions,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export type {
    MenuCheckboxItemProps as ContextMenuCheckboxItemProps,
    MenuCheckboxItemState as ContextMenuCheckboxItemState,
} from "../menu/menu-checkbox-item.tsx";
export type { MenuCheckboxItemIndicatorProps as ContextMenuCheckboxItemIndicatorProps } from "../menu/menu-checkbox-item-indicator.tsx";
export type {
    MenuItemProps as ContextMenuItemProps,
    MenuItemState as ContextMenuItemState,
} from "../menu/menu-item.tsx";
export type { MenuPortalProps as ContextMenuPortalProps } from "../menu/menu-portal.tsx";
export type {
    MenuPositionerProps as ContextMenuPositionerProps,
    MenuPositionerState as ContextMenuPositionerState,
} from "../menu/menu-positioner.tsx";
export type { MenuRadioGroupProps as ContextMenuRadioGroupProps } from "../menu/menu-radio-group.tsx";
export type {
    MenuRadioItemProps as ContextMenuRadioItemProps,
    MenuRadioItemState as ContextMenuRadioItemState,
} from "../menu/menu-radio-item.tsx";
export type { MenuRadioItemIndicatorProps as ContextMenuRadioItemIndicatorProps } from "../menu/menu-radio-item-indicator.tsx";
export type { MenuSubmenuRootProps as ContextMenuSubmenuRootProps } from "../menu/menu-root.tsx";
export type {
    MenuSubmenuTriggerProps as ContextMenuSubmenuTriggerProps,
    MenuSubmenuTriggerState as ContextMenuSubmenuTriggerState,
} from "../menu/menu-submenu-trigger.tsx";
export type { ContextMenuRootProps } from "./context-menu-root.tsx";
export type { ContextMenuTriggerState } from "./context-menu-trigger.tsx";
export { ContextMenu } from "./parts.ts";
