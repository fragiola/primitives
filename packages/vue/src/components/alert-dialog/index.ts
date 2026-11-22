// The entry of @fragiola/primitives-vue/alert-dialog: a modal alert dialog, never dismissed from
// outside (spec/alert-dialog.md, the APG's alertdialog pattern). Its parts are Dialog's, from the
// dialog's modules, named `alert-dialog-*` by its Root.

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
    DialogBackdropProps as AlertDialogBackdropProps,
    DialogBackdropState as AlertDialogBackdropState,
} from "../dialog/dialog-backdrop.ts";
export type {
    DialogPopupProps as AlertDialogPopupProps,
    DialogPopupState as AlertDialogPopupState,
} from "../dialog/dialog-popup.ts";
export type { DialogPortalProps as AlertDialogPortalProps } from "../dialog/dialog-portal.ts";
export type { DialogTriggerState as AlertDialogTriggerState } from "../dialog/dialog-trigger.ts";
export type { DialogViewportState as AlertDialogViewportState } from "../dialog/dialog-viewport.ts";
export {
    type AlertDialogHandle,
    createAlertDialogHandle,
} from "./alert-dialog-handle.ts";
export type {
    AlertDialogRootEmits,
    AlertDialogRootProps,
} from "./alert-dialog-root.ts";
export type { AlertDialogTriggerProps } from "./alert-dialog-trigger-props.ts";
export { AlertDialog } from "./parts.ts";
