import type { ReactNode } from "react";
import { DialogClose } from "../dialog/dialog-close.tsx";
import { DialogDescription } from "../dialog/dialog-description.tsx";
import { DialogPortal } from "../dialog/dialog-portal.tsx";
import { DialogTitle } from "../dialog/dialog-title.tsx";
import { DialogTrigger } from "../dialog/dialog-trigger.tsx";
import { DrawerBackdrop } from "./drawer-backdrop.tsx";
import { DrawerContent } from "./drawer-content.tsx";
import { createDrawerHandle } from "./drawer-handle.ts";
import { DrawerPopup } from "./drawer-popup.tsx";
import { DrawerRoot } from "./drawer-root.tsx";
import type { DrawerTriggerProps } from "./drawer-trigger-props.ts";
import { DrawerViewport } from "./drawer-viewport.tsx";

/** spec/drawer.md: Dialog's parts, named `drawer-*` by the Root, with the swipe */
export const Drawer = {
    Root: DrawerRoot,
    // Dialog's Trigger, typed with a Drawer handle
    Trigger: DialogTrigger as <Payload = unknown>(
        props: DrawerTriggerProps<Payload>,
    ) => ReactNode,
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
