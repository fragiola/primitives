import {
    DialogRootBase,
    type DialogRootSharedProps,
} from "../dialog/dialog-root-base.tsx";
import type { AlertDialogHandle } from "./alert-dialog-handle.ts";

export interface AlertDialogRootProps<Payload = unknown>
    extends DialogRootSharedProps<Payload> {
    /** Connects Triggers rendered outside the Root (spec/alert-dialog.md, "Detached triggers"). */
    handle?: AlertDialogHandle<Payload>;
}

/**
 * Holds the alert dialog's state; renders no element (spec/alert-dialog.md). Its parts are
 * Dialog's, named `alert-dialog-*`: always modal, never dismissed from outside, its first Close
 * focused on open.
 */
export function AlertDialogRoot<Payload = unknown>(
    props: AlertDialogRootProps<Payload>,
) {
    return <DialogRootBase {...props} component="alert-dialog" />;
}
