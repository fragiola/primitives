// The entry of @fragiola/primitives-react/drawer: a modal panel at an edge of the screen, swiped
// away, with snap points (spec/drawer.md). Its parts are Dialog's, from the dialog's modules, named
// `drawer-*` by its Root; the swipe is the toolkit's `/swipe` entry.

export type {
    ResolvedSnapPoint,
    SnapPoint,
    SwipeDirection,
} from "@fragiola/primitives/swipe";
export type { OverlayPortalProps } from "../../hooks/use-overlay-portal.ts";
export type {
    OverlayRootProps,
    OverlayTriggerRootProps,
} from "../../hooks/use-overlay-root.ts";
export type { OverlayTriggerProps } from "../../hooks/use-overlay-trigger.ts";
export type {
    ChangeDetails,
    ChangeReason,
    FocusTarget,
    OpenChangeDetails,
    OverlayActions,
} from "../../utils/change-details.ts";
export type { OverlayHandle } from "../../utils/overlay-handle.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export type {
    DialogBackdropProps as DrawerBackdropProps,
    DialogBackdropState as DrawerBackdropState,
} from "../dialog/dialog-backdrop.tsx";
export type { DialogPortalProps as DrawerPortalProps } from "../dialog/dialog-portal.tsx";
export type { DialogTriggerState as DrawerTriggerState } from "../dialog/dialog-trigger.tsx";
export type { DialogViewportState as DrawerViewportState } from "../dialog/dialog-viewport.tsx";
export { createDrawerHandle, type DrawerHandle } from "./drawer-handle.ts";
export type { DrawerPopupProps, DrawerPopupState } from "./drawer-popup.tsx";
export type { DrawerRootProps } from "./drawer-root.tsx";
export type { DrawerTriggerProps } from "./drawer-trigger-props.ts";
export { Drawer } from "./parts.ts";
