import {
    type OverlayHandle,
    OverlayHandleStore,
} from "../../utils/overlay-handle.ts";

/** An AlertDialog's handle: its detached Triggers and imperative opening (spec/alert-dialog.md). */
export interface AlertDialogHandle<Payload = unknown>
    extends OverlayHandle<Payload> {
    readonly component: "alert-dialog";
}

/** Creates an AlertDialog handle (`AlertDialog.createHandle`), for Triggers outside the Root. */
export function createAlertDialogHandle<
    Payload = unknown,
>(): AlertDialogHandle<Payload> {
    return new OverlayHandleStore<Payload>(
        "alert-dialog",
    ) as AlertDialogHandle<Payload>;
}
