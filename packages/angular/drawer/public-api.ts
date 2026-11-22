// The entry of @fragiola/primitives-angular/drawer: a modal panel at an edge of the screen, swiped
// away, with snap points (spec/drawer.md). Its directives are Dialog's
// (`@fragiola/primitives-angular/dialog`) under their own selectors, named `drawer-*` by its root,
// plus the swipe (the toolkit's `/swipe` entry).

export type {
    ResolvedSnapPoint,
    SnapPoint,
    SwipeDirection,
} from "@fragiola/primitives/swipe";
export type {
    DialogBackdropState as DrawerBackdropState,
    DialogState as DrawerState,
    DialogTriggerState as DrawerTriggerState,
    DialogViewportState as DrawerViewportState,
} from "@fragiola/primitives-angular/dialog";
export type {
    ChangeDetails,
    ChangeReason,
    FocusTarget,
    OpenChangeDetails,
    OpenChangeEvent,
    OverlayActions,
    OverlayHandle,
    OverlayPortalOptions,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { DrawerBackdrop } from "./directives/drawer-backdrop.directive.ts";
export { DrawerClose } from "./directives/drawer-close.directive.ts";
export { DrawerContent } from "./directives/drawer-content.directive.ts";
export { DrawerDescription } from "./directives/drawer-description.directive.ts";
export {
    DrawerPopup,
    type DrawerPopupState,
} from "./directives/drawer-popup.directive.ts";
export { DrawerPortal } from "./directives/drawer-portal.directive.ts";
export {
    DrawerRoot,
    type DrawerSwipeState,
} from "./directives/drawer-root.directive.ts";
export { DrawerTitle } from "./directives/drawer-title.directive.ts";
export { DrawerTrigger } from "./directives/drawer-trigger.directive.ts";
export { DrawerViewport } from "./directives/drawer-viewport.directive.ts";
export {
    createDrawerHandle,
    type DrawerHandle,
} from "./utils/drawer-handle.ts";
