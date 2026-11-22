import type { PartComponent } from "../../utils/public-component.ts";
import { DialogBackdrop } from "../dialog/dialog-backdrop.ts";
import { DialogClose } from "../dialog/dialog-close.ts";
import { DialogDescription } from "../dialog/dialog-description.ts";
import { DialogPopup } from "../dialog/dialog-popup.ts";
import { DialogPortal } from "../dialog/dialog-portal.ts";
import { DialogTitle } from "../dialog/dialog-title.ts";
import {
    DialogTrigger,
    type DialogTriggerState,
} from "../dialog/dialog-trigger.ts";
import { DialogViewport } from "../dialog/dialog-viewport.ts";
import { createAlertDialogHandle } from "./alert-dialog-handle.ts";
import { AlertDialogRoot } from "./alert-dialog-root.ts";
import type { AlertDialogTriggerProps } from "./alert-dialog-trigger-props.ts";

/** spec/alert-dialog.md: Dialog's parts, named `alert-dialog-*` by the Root */
export const AlertDialog = {
    Root: AlertDialogRoot,
    // Dialog's Trigger, typed with an AlertDialog handle
    Trigger: DialogTrigger as unknown as PartComponent<
        AlertDialogTriggerProps,
        DialogTriggerState
    >,
    Portal: DialogPortal,
    Backdrop: DialogBackdrop,
    Viewport: DialogViewport,
    Popup: DialogPopup,
    Title: DialogTitle,
    Description: DialogDescription,
    Close: DialogClose,
    createHandle: createAlertDialogHandle,
};
