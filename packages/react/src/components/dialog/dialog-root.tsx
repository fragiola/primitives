import type { DialogHandle } from "./dialog-handle.ts";
import {
    DialogRootBase,
    type DialogRootSharedProps,
} from "./dialog-root-base.tsx";

export interface DialogRootProps<Payload = unknown>
    extends DialogRootSharedProps<Payload> {
    /** Connects Triggers rendered outside the Root (spec/dialog.md, "Detached triggers"). */
    handle?: DialogHandle<Payload>;
}

/** Holds the dialog's state; renders no element (spec/dialog.md). */
export function DialogRoot<Payload = unknown>(props: DialogRootProps<Payload>) {
    return <DialogRootBase {...props} component="dialog" />;
}
