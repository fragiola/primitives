// The entry of @fragiola/primitives-vue/drawer: a modal panel at an edge of the screen, swiped
// away, with snap points (spec/drawer.md). Its parts are Dialog's, from the dialog's modules, named
// `drawer-*` by its Root; the swipe is the toolkit's `/swipe` entry.

export type {
    ResolvedSnapPoint,
    SnapPoint,
    SwipeDirection,
} from "@fragiola/primitives/swipe";
export type {
    OverlayRootEmits,
    OverlayRootProps,
    OverlayTriggerRootProps,
} from "../../composables/use-overlay-root.ts";
export type { OverlayTriggerProps } from "../../composables/use-overlay-trigger.ts";
export type {
    ChangeDetails,
    ChangeReason,
    FocusTarget,
    OpenChangeDetails,
    OverlayActions,
} from "../../utils/change-details.ts";
export type { OverlayHandle } from "../../utils/overlay-handle.ts";
export type { OverlayPortalProps } from "../../utils/overlay-portal.ts";
export type { OverlayRootSlots } from "../../utils/public-component.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type {
    DialogBackdropProps as DrawerBackdropProps,
    DialogBackdropState as DrawerBackdropState,
} from "../dialog/dialog-backdrop.ts";
export type { DialogPortalProps as DrawerPortalProps } from "../dialog/dialog-portal.ts";
export type { DialogTriggerState as DrawerTriggerState } from "../dialog/dialog-trigger.ts";
export type { DialogViewportState as DrawerViewportState } from "../dialog/dialog-viewport.ts";
export { createDrawerHandle, type DrawerHandle } from "./drawer-handle.ts";
export type { DrawerPopupProps, DrawerPopupState } from "./drawer-popup.ts";
export type { DrawerRootEmits, DrawerRootProps } from "./drawer-root.ts";
export type { DrawerTriggerProps } from "./drawer-trigger-props.ts";
export { Drawer } from "./parts.ts";
