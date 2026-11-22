import { DialogBackdrop } from "./dialog-backdrop.tsx";
import { DialogClose } from "./dialog-close.tsx";
import { DialogDescription } from "./dialog-description.tsx";
import { createDialogHandle } from "./dialog-handle.ts";
import { DialogPopup } from "./dialog-popup.tsx";
import { DialogPortal } from "./dialog-portal.tsx";
import { DialogRoot } from "./dialog-root.tsx";
import { DialogTitle } from "./dialog-title.tsx";
import { DialogTrigger } from "./dialog-trigger.tsx";
import { DialogViewport } from "./dialog-viewport.tsx";

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
