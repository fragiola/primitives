import {
    AlertDialogBackdrop,
    AlertDialogClose,
    AlertDialogDescription,
    AlertDialogPopup,
    AlertDialogPortal,
    AlertDialogRoot,
    AlertDialogTitle,
    AlertDialogTrigger,
    AlertDialogViewport,
} from "@fragiola/primitives-angular/alert-dialog";

/** Every AlertDialog directive, for a scenario's `imports`. */
export const ALERT_DIALOG_PARTS = [
    AlertDialogRoot,
    AlertDialogTrigger,
    AlertDialogPortal,
    AlertDialogBackdrop,
    AlertDialogViewport,
    AlertDialogPopup,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogClose,
] as const;
