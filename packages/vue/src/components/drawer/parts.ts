import type { PartComponent } from "../../utils/public-component.ts";
import { DialogClose } from "../dialog/dialog-close.ts";
import { DialogDescription } from "../dialog/dialog-description.ts";
import { DialogPortal } from "../dialog/dialog-portal.ts";
import { DialogTitle } from "../dialog/dialog-title.ts";
import {
    DialogTrigger,
    type DialogTriggerState,
} from "../dialog/dialog-trigger.ts";
import { DrawerBackdrop } from "./drawer-backdrop.ts";
import { DrawerContent } from "./drawer-content.ts";
import { createDrawerHandle } from "./drawer-handle.ts";
import { DrawerPopup } from "./drawer-popup.ts";
import { DrawerRoot } from "./drawer-root.ts";
import type { DrawerTriggerProps } from "./drawer-trigger-props.ts";
import { DrawerViewport } from "./drawer-viewport.ts";

/** spec/drawer.md: Dialog's parts, named `drawer-*` by the Root, with the swipe */
export const Drawer = {
    Root: DrawerRoot,
    // Dialog's Trigger, typed with a Drawer handle
    Trigger: DialogTrigger as unknown as PartComponent<
        DrawerTriggerProps,
        DialogTriggerState
    >,
    Portal: DialogPortal,
    Backdrop: DrawerBackdrop,
    Viewport: DrawerViewport,
    Popup: DrawerPopup,
    Content: DrawerContent,
    Title: DialogTitle,
    Description: DialogDescription,
    Close: DialogClose,
    createHandle: createDrawerHandle,
};
