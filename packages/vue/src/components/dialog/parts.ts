import { DialogBackdrop } from "./dialog-backdrop.ts";
import { DialogClose } from "./dialog-close.ts";
import { DialogDescription } from "./dialog-description.ts";
import { createDialogHandle } from "./dialog-handle.ts";
import { DialogPopup } from "./dialog-popup.ts";
import { DialogPortal } from "./dialog-portal.ts";
import { DialogRoot } from "./dialog-root.ts";
import { DialogTitle } from "./dialog-title.ts";
import { DialogTrigger } from "./dialog-trigger.ts";
import { DialogViewport } from "./dialog-viewport.ts";

/** spec/dialog.md */
export const Dialog = {
    Root: DialogRoot,
    Trigger: DialogTrigger,
    Portal: DialogPortal,
    Backdrop: DialogBackdrop,
    Viewport: DialogViewport,
    Popup: DialogPopup,
    Title: DialogTitle,
    Description: DialogDescription,
    Close: DialogClose,
    createHandle: createDialogHandle,
};
