// The entry of @fragiola/primitives-vue/toast: notifications in a stack, announced through live
// regions, on the toolkit's toast queue (spec/toast.md; `@fragiola/primitives/toast`).

export type { SwipeDirection } from "@fragiola/primitives/swipe";
export type {
    ToastManager,
    ToastManagerOptions,
    ToastObject,
    ToastOptions,
    ToastPriority,
    ToastPromiseOptions,
    ToastUpdate,
} from "@fragiola/primitives/toast";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export { createToastManager } from "./create-toast-manager.ts";
export { Toast } from "./parts.ts";
export type { ToastPortalProps } from "./toast-portal.ts";
export type { ToastProviderProps } from "./toast-provider.ts";
export type { ToastRootProps, ToastRootState } from "./toast-root.ts";
export type { ToastViewportState } from "./toast-viewport.ts";
export {
    type UseToastManagerValue,
    useToastManager,
} from "./use-toast-manager.ts";
