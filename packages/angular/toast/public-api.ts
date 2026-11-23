// The entry of @fragiola/primitives-angular/toast: notifications in a stack, announced through
// live regions, on the toolkit's toast queue (spec/toast.md; `@fragiola/primitives/toast`), as
// standalone attribute directives on the consumer's own elements.

export type { SwipeDirection } from "@fragiola/primitives/swipe";
export type {
    ToastManager,
    ToastManagerOptions,
    ToastObject,
    ToastOptions,
    ToastPriority,
    ToastPromiseOptions,
    ToastUpdate,
} from "@fragiola/primitives/toast";
export type { OverlayPortalOptions } from "@fragiola/primitives-angular/internal";
export { ToastAction } from "./directives/toast-action.directive.ts";
export { ToastClose } from "./directives/toast-close.directive.ts";
export { ToastDescription } from "./directives/toast-description.directive.ts";
export { ToastPortal } from "./directives/toast-portal.directive.ts";
export { ToastProvider } from "./directives/toast-provider.directive.ts";
export {
    ToastRoot,
    type ToastRootState,
} from "./directives/toast-root.directive.ts";
export { ToastTitle } from "./directives/toast-title.directive.ts";
export {
    ToastViewport,
    type ToastViewportState,
} from "./directives/toast-viewport.directive.ts";
export {
    type InjectedToastManager,
    injectToastManager,
} from "./inject/inject-toast-manager.ts";
export { createToastManager } from "./utils/create-toast-manager.ts";
