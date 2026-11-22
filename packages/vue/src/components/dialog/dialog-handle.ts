import {
    type OverlayHandle,
    OverlayHandleStore,
} from "../../utils/overlay-handle.ts";

/** A Dialog's handle: its detached Triggers and imperative opening (spec/dialog.md). */
export interface DialogHandle<Payload = unknown>
    extends OverlayHandle<Payload> {
    readonly component: "dialog";
}

/** Creates a Dialog handle (`Dialog.createHandle`), for Triggers outside the Root. */
export const createDialogHandle: <
    Payload = unknown,
>() => DialogHandle<Payload> = <Payload>() =>
    new OverlayHandleStore<Payload>("dialog") as DialogHandle<Payload>;
