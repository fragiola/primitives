// The entry of @fragiola/primitives/toast: the toast queue (a manager a plain module can import), a Viewport's watch (the F6 landmark, the pauses, the live regions) and a toast's measure.

export { measureToastHeight } from "./measure-toast-height.ts";
export {
    createToastManager,
    type ToastManager,
    type ToastManagerOptions,
    type ToastObject,
    type ToastOptions,
    type ToastPriority,
    type ToastPromiseOptions,
    type ToastUpdate,
} from "./toast-manager.ts";
export {
    type ToastViewportWatch,
    type ToastViewportWatchOptions,
    watchToastViewport,
} from "./watch-toast-viewport.ts";
