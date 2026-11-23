import {
    ToastAction,
    ToastClose,
    ToastDescription,
    ToastPortal,
    ToastRoot,
    ToastTitle,
    ToastViewport,
} from "@fragiola/primitives-angular/toast";

/** Every Toast directive but the Provider (the route puts it on the scenario's `<main>`). */
export const TOAST_PARTS = [
    ToastPortal,
    ToastViewport,
    ToastRoot,
    ToastTitle,
    ToastDescription,
    ToastAction,
    ToastClose,
] as const;
