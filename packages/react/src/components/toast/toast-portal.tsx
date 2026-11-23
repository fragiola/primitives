import {
    type OverlayPortalProps,
    useOverlayPortal,
} from "../../hooks/use-overlay-portal.ts";

export interface ToastPortalProps
    extends Omit<OverlayPortalProps, "keepMounted"> {}

/** Renders the Viewport into `container` (default `body`), in the browser only (spec/toast.md). */
export function ToastPortal(props: ToastPortalProps) {
    return useOverlayPortal(true, props);
}
