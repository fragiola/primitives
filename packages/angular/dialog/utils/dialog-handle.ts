import {
    type OverlayHandle,
    OverlayHandleStore,
} from "@fragiola/primitives-angular/internal";

/** A Dialog's handle: its detached triggers and imperative opening (spec/dialog.md). */
export interface DialogHandle<Payload = unknown>
    extends OverlayHandle<Payload> {
    readonly component: "dialog";
}

/** Creates a Dialog handle, for `[dialogTrigger]`s outside the `[dialogRoot]` (`[handle]`). */
export function createDialogHandle<Payload = unknown>(): DialogHandle<Payload> {
    return new OverlayHandleStore<Payload>("dialog") as DialogHandle<Payload>;
}
