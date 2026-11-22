import {
    type OverlayPortalProps,
    useOverlayPortal,
} from "../../hooks/use-overlay-portal.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { DialogContext } from "./dialog-context.ts";

export interface DialogPortalProps extends OverlayPortalProps {}

/**
 * Moves the backdrop, the viewport and the popup to the end of `body` while the dialog is open or
 * closing (always with `keepMounted`).
 */
export function DialogPortal(props: DialogPortalProps) {
    const context = useRequiredContext(DialogContext, "Dialog.Portal");
    return useOverlayPortal(context.presence.mounted, props);
}
