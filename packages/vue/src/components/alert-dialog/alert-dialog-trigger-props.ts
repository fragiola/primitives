import type { DialogTriggerProps } from "../dialog/dialog-trigger.ts";
import type { AlertDialogHandle } from "./alert-dialog-handle.ts";

/** The props of `AlertDialog.Trigger` (Dialog's Trigger), with an AlertDialog handle. */
export interface AlertDialogTriggerProps
    extends Omit<DialogTriggerProps, "handle"> {
    /** The handle of a Root this Trigger opens from anywhere (spec/alert-dialog.md). */
    handle?: AlertDialogHandle;
}
