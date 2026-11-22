import {
    DialogBackdrop,
    DialogClose,
    DialogDescription,
    DialogPopup,
    DialogPortal,
    DialogRoot,
    DialogTitle,
    DialogTrigger,
    DialogViewport,
} from "@fragiola/primitives-angular/dialog";

/** Every Dialog directive, for a scenario's `imports`. */
export const DIALOG_PARTS = [
    DialogRoot,
    DialogTrigger,
    DialogPortal,
    DialogBackdrop,
    DialogViewport,
    DialogPopup,
    DialogTitle,
    DialogDescription,
    DialogClose,
] as const;
