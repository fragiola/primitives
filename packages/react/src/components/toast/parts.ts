import { createToastManager } from "./create-toast-manager.ts";
import { ToastAction } from "./toast-action.tsx";
import { ToastClose } from "./toast-close.tsx";
import { ToastDescription } from "./toast-description.tsx";
import { ToastPortal } from "./toast-portal.tsx";
import { ToastProvider } from "./toast-provider.tsx";
import { ToastRoot } from "./toast-root.tsx";
import { ToastTitle } from "./toast-title.tsx";
import { ToastViewport } from "./toast-viewport.tsx";
import { useToastManager } from "./use-toast-manager.ts";

/** spec/toast.md */
export const Toast = {
    Provider: ToastProvider,
    Portal: ToastPortal,
    Viewport: ToastViewport,
    Root: ToastRoot,
    Title: ToastTitle,
    Description: ToastDescription,
    Action: ToastAction,
    Close: ToastClose,
    createToastManager,
    useToastManager,
};
