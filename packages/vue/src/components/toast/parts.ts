import { createToastManager } from "./create-toast-manager.ts";
import { ToastAction } from "./toast-action.ts";
import { ToastClose } from "./toast-close.ts";
import { ToastDescription } from "./toast-description.ts";
import { ToastPortal } from "./toast-portal.ts";
import { ToastProvider } from "./toast-provider.ts";
import { ToastRoot } from "./toast-root.ts";
import { ToastTitle } from "./toast-title.ts";
import { ToastViewport } from "./toast-viewport.ts";
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
