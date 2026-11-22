// The entry of @fragiola/primitives-react/alert-dialog: a modal alert dialog, never dismissed from
// outside (spec/alert-dialog.md, the APG's alertdialog pattern). Its parts are Dialog's, from the
// dialog's modules, named `alert-dialog-*` by its Root.

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
    DialogBackdropProps as AlertDialogBackdropProps,
    DialogBackdropState as AlertDialogBackdropState,
} from "../dialog/dialog-backdrop.tsx";
export type {
    DialogPopupProps as AlertDialogPopupProps,
    DialogPopupState as AlertDialogPopupState,
} from "../dialog/dialog-popup.tsx";
export type { DialogPortalProps as AlertDialogPortalProps } from "../dialog/dialog-portal.tsx";
export type { DialogTriggerState as AlertDialogTriggerState } from "../dialog/dialog-trigger.tsx";
export type { DialogViewportState as AlertDialogViewportState } from "../dialog/dialog-viewport.tsx";
export {
    type AlertDialogHandle,
    createAlertDialogHandle,
} from "./alert-dialog-handle.ts";
export type { AlertDialogRootProps } from "./alert-dialog-root.tsx";
export type { AlertDialogTriggerProps } from "./alert-dialog-trigger-props.ts";
export { AlertDialog } from "./parts.ts";
