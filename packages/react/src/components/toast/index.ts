// The entry of @fragiola/primitives-react/toast: notifications in a stack, announced through live
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
export type { OverlayPortalProps } from "../../hooks/use-overlay-portal.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export { createToastManager } from "./create-toast-manager.ts";
export { Toast } from "./parts.ts";
export type { ToastPortalProps } from "./toast-portal.tsx";
export type { ToastProviderProps } from "./toast-provider.tsx";
export type { ToastRootProps, ToastRootState } from "./toast-root.tsx";
export type { ToastViewportState } from "./toast-viewport.tsx";
export {
    type UseToastManagerValue,
    useToastManager,
} from "./use-toast-manager.ts";
