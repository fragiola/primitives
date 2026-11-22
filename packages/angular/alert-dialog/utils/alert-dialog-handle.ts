import {
    type OverlayHandle,
    OverlayHandleStore,
} from "@fragiola/primitives-angular/internal";

/** An AlertDialog's handle: its detached triggers and imperative opening (spec/alert-dialog.md). */
export interface AlertDialogHandle<Payload = unknown>
    extends OverlayHandle<Payload> {
    readonly component: "alert-dialog";
}

/**
 * Creates an AlertDialog handle, for `[alertDialogTrigger]`s outside the `[alertDialogRoot]`
 * (`[handle]`).
 */
export function createAlertDialogHandle<
    Payload = unknown,
>(): AlertDialogHandle<Payload> {
    return new OverlayHandleStore<Payload>(
        "alert-dialog",
    ) as AlertDialogHandle<Payload>;
}
