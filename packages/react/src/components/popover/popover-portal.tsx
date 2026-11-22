import {
    type OverlayPortalProps,
    useOverlayPortal,
} from "../../hooks/use-overlay-portal.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { PopoverContext } from "./popover-context.ts";

export interface PopoverPortalProps extends OverlayPortalProps {}

export function PopoverPortal(props: PopoverPortalProps) {
    const context = useRequiredContext(PopoverContext, "Popover.Portal");
    return useOverlayPortal(context.presence.mounted, props);
}
