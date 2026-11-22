import {
    DrawerBackdrop,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerPopup,
    DrawerPortal,
    DrawerRoot,
    DrawerTitle,
    DrawerTrigger,
    DrawerViewport,
} from "@fragiola/primitives-angular/drawer";

/** Every Drawer directive, for a scenario's `imports`. */
export const DRAWER_PARTS = [
    DrawerRoot,
    DrawerTrigger,
    DrawerPortal,
    DrawerBackdrop,
    DrawerViewport,
    DrawerPopup,
    DrawerContent,
    DrawerTitle,
    DrawerDescription,
    DrawerClose,
] as const;
