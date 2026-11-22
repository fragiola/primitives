// The entry of @fragiola/primitives-angular/alert-dialog: a modal alert dialog, never dismissed
// from outside (spec/alert-dialog.md, the APG's alertdialog pattern). Its directives are Dialog's
// (`@fragiola/primitives-angular/dialog`) under their own selectors, named `alert-dialog-*` by
// its root.

export type {
    DialogBackdropState as AlertDialogBackdropState,
    DialogPopupState as AlertDialogPopupState,
    DialogState as AlertDialogState,
    DialogTriggerState as AlertDialogTriggerState,
    DialogViewportState as AlertDialogViewportState,
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
} from "@fragiola/primitives-angular/internal";
export { AlertDialogBackdrop } from "./directives/alert-dialog-backdrop.directive.ts";
export { AlertDialogClose } from "./directives/alert-dialog-close.directive.ts";
export { AlertDialogDescription } from "./directives/alert-dialog-description.directive.ts";
export { AlertDialogPopup } from "./directives/alert-dialog-popup.directive.ts";
export { AlertDialogPortal } from "./directives/alert-dialog-portal.directive.ts";
export { AlertDialogRoot } from "./directives/alert-dialog-root.directive.ts";
export { AlertDialogTitle } from "./directives/alert-dialog-title.directive.ts";
export { AlertDialogTrigger } from "./directives/alert-dialog-trigger.directive.ts";
export { AlertDialogViewport } from "./directives/alert-dialog-viewport.directive.ts";
export {
    type AlertDialogHandle,
    createAlertDialogHandle,
} from "./utils/alert-dialog-handle.ts";
