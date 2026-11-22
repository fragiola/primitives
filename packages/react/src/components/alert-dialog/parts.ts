import type { ReactNode } from "react";
import { DialogBackdrop } from "../dialog/dialog-backdrop.tsx";
import { DialogClose } from "../dialog/dialog-close.tsx";
import { DialogDescription } from "../dialog/dialog-description.tsx";
import { DialogPopup } from "../dialog/dialog-popup.tsx";
import { DialogPortal } from "../dialog/dialog-portal.tsx";
import { DialogTitle } from "../dialog/dialog-title.tsx";
import { DialogTrigger } from "../dialog/dialog-trigger.tsx";
import { DialogViewport } from "../dialog/dialog-viewport.tsx";
import { createAlertDialogHandle } from "./alert-dialog-handle.ts";
import { AlertDialogRoot } from "./alert-dialog-root.tsx";
import type { AlertDialogTriggerProps } from "./alert-dialog-trigger-props.ts";

/** spec/alert-dialog.md: Dialog's parts, named `alert-dialog-*` by the Root */
export const AlertDialog = {
    Root: AlertDialogRoot,
    // Dialog's Trigger, typed with an AlertDialog handle
    Trigger: DialogTrigger as <Payload = unknown>(
        props: AlertDialogTriggerProps<Payload>,
    ) => ReactNode,
    Portal: DialogPortal,
    Backdrop: DialogBackdrop,
    Viewport: DialogViewport,
    Popup: DialogPopup,
    Title: DialogTitle,
    Description: DialogDescription,
    Close: DialogClose,
    createHandle: createAlertDialogHandle,
};
