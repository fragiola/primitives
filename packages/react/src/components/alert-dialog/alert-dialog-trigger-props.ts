import type { DialogTriggerProps } from "../dialog/dialog-trigger.tsx";
import type { AlertDialogHandle } from "./alert-dialog-handle.ts";

/** The props of `AlertDialog.Trigger` (Dialog's Trigger), with an AlertDialog handle. */
export interface AlertDialogTriggerProps<Payload = unknown>
    extends Omit<DialogTriggerProps<Payload>, "handle"> {
    /** The handle of a Root this Trigger opens from anywhere (spec/alert-dialog.md). */
    handle?: AlertDialogHandle<Payload>;
}
