import {
    createToastManager as createQueue,
    type ToastManager,
    type ToastManagerOptions,
} from "@fragiola/primitives/toast";

/**
 * Creates a toast queue (spec/toast.md, "The toast queue"): a plain module can create it, import
 * it anywhere and add toasts, and a `Toast.Provider` renders it (`toastManager`).
 */
export function createToastManager<Data = unknown>(
    options?: ToastManagerOptions,
): ToastManager<Data> {
    return createQueue<Data>(options);
}
